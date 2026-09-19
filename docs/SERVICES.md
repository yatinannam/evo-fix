# EvoDoc — Services Used (Pre-Launch Deployment)

A complete reference of every external service the app depends on, what it's used for, and where its credentials/config live.

---

## 1. Vercel — Frontend Hosting

**What it does:** Hosts and serves the React frontend (built with Vite).

**Repo:** `https://github.com/Gopikrishnan20/evodoc-frontend` (private, standalone repo — separate from the backend monorepo)

**Live URL:** `https://evodoc-frontend-wtee.vercel.app`

**Why this exists:** Auto-deploys on every `git push` to `main`. Free HTTPS out of the box. No server to manage.

**Config location:** Vercel Dashboard → Project → Settings → Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` = `https://api.evodev.site`

**Special file:** `vercel.json` (in the frontend repo root) — rewrites all routes to `index.html` so React Router's client-side routes (`/share/:token`, `/files`, etc.) don't 404 on direct visits or refresh.

**Cost:** Free (Hobby plan).

---

## 2. AWS EC2 — Backend Hosting

**What it does:** Runs the Node.js/Express backend — the only thing that holds secret keys, encrypts/decrypts files, calls Gemini AI, sends emails, and enforces business logic.

**Instance:** `evodoc-backend` (t3.micro, Ubuntu 26.04 LTS, region `eu-north-1` / Stockholm)

**Instance ID:** `i-0672f36cc2e90c9e4`

**Elastic IP:** `51.20.178.12` — a *static* IP permanently associated with the instance, so it never changes across stop/start (needed so DNS keeps pointing to the right place).

**Process manager:** PM2 (`pm2 start src/server.js --name evodoc-backend`) — keeps the app running, restarts on crash, and is configured (`pm2 startup` + `pm2 save`) to auto-start after a reboot.

**Ports open (Security Group `launch-wizard-3`):**
| Port | Purpose |
|------|---------|
| 22 | SSH access |
| 80 | HTTP (Nginx → redirects/serves before SSL) |
| 443 | HTTPS (Nginx, public-facing) |
| 4000 | Direct Node app access (used during initial testing; not required once Nginx is set up) |

**Why EC2 (vs. Railway/Render free tier):** The app runs a continuous background reminder/notification scheduler. Free tiers on other platforms sleep after inactivity, which would silently stop medication reminders. EC2 stays on for as long as the instance runs.

**Cost:** Free under AWS Free Tier (750 hrs/month t3.micro) for the account's first 12 months. After that, ~$0.0108/hour (~$7.90/month if run 24/7). The Elastic IP costs ~$0.005/hour *only while the instance is stopped* (a few cents if paused overnight/weekly).

**SSH access:**
```
ssh -i "evodoc-key.pem" ubuntu@51.20.178.12
```

**Where the backend code lives on the server:** `~/evodoc/backend` (cloned from the *monorepo* — `https://github.com/EvoDev-WWorks/evodoc`, not the standalone frontend repo).

**Where secrets live:** `~/evodoc/backend/.env` (never committed to git; copied by hand from the local `backend/.env`).

---

## 3. Nginx — Reverse Proxy (on the EC2 server)

**What it does:** Sits in front of the Node app. Listens on ports 80/443 and forwards requests to the app on `localhost:4000`. Also enforces a 25MB request body limit (matches the app's file upload limit).

**Config file:** `/etc/nginx/sites-available/evodoc` (symlinked into `/etc/nginx/sites-enabled/`)

**Why it's needed:** Node itself only listens on port 4000 over plain HTTP. Nginx is what makes `https://api.evodev.site` possible — it terminates SSL and hands clean HTTP traffic to the app. This is also what Certbot (below) hooks into for automatic certificate renewal.

**Cost:** Free (open-source, bundled with Ubuntu's package manager).

---

## 4. Let's Encrypt (via Certbot) — Free SSL Certificate

**What it does:** Issues and auto-renews the HTTPS certificate for `api.evodev.site`.

**Why it's needed:** Browsers block a HTTPS page (the Vercel frontend) from calling a plain HTTP API (mixed-content policy). Without this cert, the backend was unreachable from the deployed frontend — file uploads, AI extraction, family invites, etc. all failed with "Failed to fetch."

**Certificate location on server:** `/etc/letsencrypt/live/api.evodev.site/`

**Expiry / renewal:** Valid 90 days; Certbot installs a background timer that renews it automatically — no manual action needed.

**Cost:** Free, forever.

---

## 5. Namecheap — Domain Registrar & DNS

**What it does:** Owns the domain `evodev.site` and hosts its DNS records.

**DNS records configured (Advanced DNS → Host Records):**
| Type | Host | Points to | Purpose |
|------|------|-----------|---------|
| A | `api` | `51.20.178.12` | Routes `api.evodev.site` to the EC2 backend |
| TXT | `resend._domainkey` | (DKIM key from Resend) | Email authentication (DKIM) |
| MX | `send` | `feedback-smtp.<region>.amazonses.com` | Resend's bounce-handling mail route |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Email authentication (SPF) |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | Email authentication (DMARC, optional) |

**Note:** `Mail Settings` on the domain had to be switched to **Custom MX** to unlock adding the `send` MX record — this only affects the `send` subdomain, not the root domain's own email.

**Cost:** Already paid (annual domain registration). DNS hosting and all record changes are free.

---

## 6. Supabase — Database, Auth & File Storage

**What it does:** The system of record for everything except encrypted file bytes.
- **Postgres database** — all app tables (`profiles`, `medical_files`, `file_bundles`, `family_connections`, `connection_otps`, `connection_audit_log`, `reminders`, `health_readings`, `shared_links`, etc.), all protected by Row Level Security (RLS) policies.
- **Auth** — email/password sign-up & login, and Google OAuth sign-in.
- **Storage** — a private bucket holding the *encrypted* file blobs (the backend encrypts before upload and decrypts on download — Supabase never sees plaintext).

**Two API keys used, for different trust levels:**
| Key | Used by | Purpose |
|-----|---------|---------|
| `SUPABASE_ANON_KEY` | Frontend (public) | Row-level-secured queries as the logged-in user |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only (never sent to browser) | Bypasses RLS for admin tasks — streaming shared files to link holders, managing OTP codes, sending family invites |

**Auth → URL Configuration (must match the live frontend URL):**
- Site URL: `https://evodoc-frontend-wtee.vercel.app`
- Redirect URLs: same URL + `/**` wildcard

*(If the Vercel project is ever deleted/re-created and the domain suffix changes, this must be updated again, or Google OAuth redirects to a 404.)*

**Auth → Providers → Google:** Client ID + Client Secret (from Google Cloud Console) pasted in here — this is what makes "Continue with Google" work. Supabase handles the entire OAuth handshake; the app's own code never talks to Google directly.

**Cost:** Free tier (generous limits for a pre-launch app of this size).

---

## 7. Google Cloud Console — OAuth Credentials

**What it does:** Issues the **Client ID** and **Client Secret** that let Supabase perform "Sign in with Google" on the app's behalf.

**What's configured:** An OAuth 2.0 Client ID (Web Application) with one authorized redirect URI:
```
https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
```
This is Supabase's callback, *not* the Vercel frontend URL — Google only ever talks to Supabase.

**Where the credentials are used:** Pasted into Supabase (Authentication → Providers → Google). The app's own code never touches them directly.

**Note:** There's no need to download or use Google's "client secrets JSON" file — only the two string values (Client ID, Client Secret) are needed, and they go straight into Supabase's dashboard.

**Cost:** Free.

---

## 8. Google Gemini — AI Prescription Reading

**What it does:** Reads an uploaded prescription photo/PDF and extracts medication names, dosages, and schedules to pre-fill the reminder form (user reviews before anything is saved).

**Where it's called from:** Backend only (`GEMINI_API_KEY` lives in the EC2 `.env`, never sent to the browser).

**Model used:** Configurable via `GEMINI_MODEL` (defaults to a Gemini Flash/Pro model — see `backend/.env.example` for the current default).

**Cost:** Pay-as-you-go via Google AI Studio; negligible at low volume (a handful of prescription reads).

---

## 9. Resend — Transactional Email

**What it does:** Sends two kinds of emails:
1. **Family OTP codes** — the 6-digit code emailed to a recipient during account-linking.
2. **Invitation notices** — telling the recipient an invite is waiting after the sender confirms the code.

**Sandbox mode (initial default):** With the default sender `onboarding@resend.dev`, Resend **only delivers to the email address the Resend account itself was signed up with** — nothing else. This is why early testing looked like "OTP not working" (the account lookup was fine; Resend was silently rejecting delivery to other recipients).

**Production fix — domain verification:** Added `evodev.site` as a verified sending domain in Resend (DKIM + SPF + DMARC records in Namecheap — see DNS table above). Once verified, the backend sender was updated:
```
EMAIL_FROM=EvoDoc <noreply@evodev.site>
```
After this, codes deliver to **any** real recipient, not just the Resend account owner.

**Where the API key lives:** `RESEND_API_KEY` in the EC2 backend `.env`. If unset, the app silently falls back to in-app-only invites (no email sent) — it never breaks the feature, just skips the email.

**Cost:** Free tier — 3,000 emails/month, 100/day. Nowhere close to that volume for OTP codes at this stage.

---

## Summary Table

| Service | Role | Monthly Cost (current usage) |
|---|---|---|
| Vercel | Frontend hosting | Free |
| AWS EC2 | Backend hosting | Free (within 12-mo free tier) |
| AWS Elastic IP | Stable backend address | ~$0–1 (cents, only while stopped) |
| Nginx | Reverse proxy / SSL termination | Free (self-hosted) |
| Let's Encrypt / Certbot | SSL certificate | Free |
| Namecheap | Domain + DNS | Already paid (annual domain fee) |
| Supabase | DB, Auth, file storage | Free tier |
| Google Cloud Console | OAuth credentials | Free |
| Google Gemini | AI prescription reading | Pay-as-you-go, negligible at low volume |
| Resend | OTP / invite emails | Free tier (3,000/mo) |

**Total real cash cost right now:** effectively $0/month beyond the domain you already bought — everything else sits comfortably inside free tiers at this usage level.
