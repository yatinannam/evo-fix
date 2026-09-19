# Setting Up EvoDoc — From Zero to Running

Total time: about 20 minutes. You need a computer with
[Node.js](https://nodejs.org) 20+ installed, and two free accounts (created below).

---

## Step 1 — Create the Supabase project (the "vault")

1. Go to [supabase.com](https://supabase.com), sign up (free), click **New project**.
2. Pick any name (e.g. `evodoc`), set a database password (save it somewhere),
   choose the region nearest you, and create. Wait ~2 minutes for provisioning.

## Step 2 — Run the database recipe

1. In your project, open **SQL Editor** (left icon strip) → **New query**.
2. Open [`backend/supabase/schema.sql`](../backend/supabase/schema.sql), copy
   **everything**, paste it into the editor, press **Run**.
3. You should see *"Success. No rows returned."* This created all tables, the
   ownership security rules, and the private file vault.

> Upgrading an installation that ran an older schema? Run
> [`backend/supabase/upgrade-encryption.sql`](../backend/supabase/upgrade-encryption.sql)
> once instead of re-running the full schema.

## Step 3 — Adjust one auth setting (recommended for testing)

**Authentication → Sign In / Providers → Email** → turn **off**
*"Confirm email"* → **Save**.

With it off, new users can log in immediately after signing up. Turn it back
on before a real public launch.

## Step 4 — Collect your four keys

| Key | Where to find it | Goes into |
|---|---|---|
| **Project URL** | Supabase → Project Settings (gear) → API | both `.env` files |
| **Publishable / anon key** | same page ("anon public" or `sb_publishable_…`) | both `.env` files |
| **Secret / service-role key** | same page, under "Secret keys" (`sb_secret_…`) | `backend/.env` **only** |
| **Gemini API key** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → Create API key | `backend/.env` **only** |

## Step 5 — Fill in the settings files

Copy the supplied `backend/.env.example` to `backend/.env`, then fill in both
environment files:

**`backend/.env`** (all secrets live here — never share or commit this file):

```ini
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

GEMINI_API_KEY=...

# Generate once with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# WARNING: losing this key makes every encrypted file permanently unreadable.
ENCRYPTION_MASTER_KEY=<64 hex characters>
```

**`frontend/.env`** (public browser values plus one server-only key):

```ini
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SHARE_BASE_URL=http://localhost:3000
# Server-only: required by the EvoDoc pre-registration API route.
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### Email delivery (family codes, welcome + pre-registration emails)

The backend sends email through **Resend** (preferred) or **AWS SES** — set one
of them in `backend/.env`:

1. **Resend** — create a free account at [resend.com](https://resend.com),
   verify your sending domain under **Domains** (e.g. `evodev.site`), create an
   API key and set `RESEND_API_KEY` + `EMAIL_FROM=EvoDoc <noreply@yourdomain>`.
2. **AWS SES** — set `AWS_REGION` and verify the sender. Note: sandbox
   accounts only deliver to verified addresses until production access is
   granted.

**Supabase's own emails** (signup confirmation, password reset, magic links)
are a separate pipeline: Supabase can only send *auth* emails, and its built-in
mailer is rate-limited to a couple of messages per hour — fine for testing,
not for real users. To make them reliable, point Supabase at the same Resend
account: **Supabase Dashboard → Project Settings → Authentication → SMTP
Settings** → enable *Custom SMTP* with

```
Host: smtp.resend.com   Port: 465   Username: resend
Password: <your RESEND_API_KEY>   Sender: noreply@yourdomain
```

then brand the templates under **Authentication → Email Templates**. Custom
application emails (family one-time codes, welcome mails, pre-registration
receipts) cannot be sent by Supabase — they always go through the backend's
provider above.

Both `.env` files are listed in `.gitignore`, so they can never be uploaded to
a code repository by accident.

## Step 6 — Install and run

Two terminals:

```bash
# Terminal 1 — the backend
cd backend
npm install
npm run dev          # → "EvoDoc backend listening on http://localhost:4000"

# Terminal 2 — the frontend
cd frontend
npm install
npm run dev          # → open http://localhost:5173
```

The backend prints a ⚠ warning at startup for any missing/placeholder key —
read those warnings; they tell you exactly what to fix.

## Step 7 — Smoke test

1. Open `http://localhost:3000`, create an account, log in through EvoCare.
2. **My Documents** → upload a prescription photo or any PDF.
3. Tick it → **Share securely** → copy the link → open it in a private/incognito
   window (you'll see the doctor's view, no login needed).
4. **Shared Links** → **Revoke** → refresh the incognito tab → access is gone.
5. **Medications** → *Smart setup* → pick the prescription → **Extract
   medications** → review the pre-filled card → **Create reminder**.

## Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| "Invalid API key" on the login page | Wrong value in `frontend/.env` (a URL pasted where the key belongs is the classic slip). Fix, then **restart** the frontend terminal — `.env` is only read at startup. |
| Sign-up works but never logs in | "Confirm email" is still ON (Step 3). |
| Upload fails | `ENCRYPTION_MASTER_KEY` missing/invalid, or Step 2's recipe (or the upgrade script) wasn't run. Check the backend terminal's warnings. |
| Share link shows "Sharing is not configured" | `SUPABASE_SERVICE_ROLE_KEY` missing in `backend/.env`. Add it, restart the backend. |
| AI extraction fails | `GEMINI_API_KEY` missing or invalid. |
| Changes to a `.env` file seem ignored | Restart the terminal that runs that part — settings files are read only at startup. |
