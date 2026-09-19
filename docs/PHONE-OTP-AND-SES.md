# Plan: Phone OTP verification + welcome email

## Context

EvoDoc currently authenticates via Supabase (email/password + Google OAuth), gated
only by `ProtectedRoute` checking for a session — there is no post-signup onboarding
step. The goal is to add a **mandatory phone-number verification** after first
signup/login (for both email and Google accounts), enforce that **one verified phone
number maps to at most one account**, and send a **one-time welcome email** when a new
account is created.

Decisions (confirmed with user):
- **SMS provider:** AWS SNS (we generate our own OTP and use SNS purely as the SMS sender).
- **Gate:** hard — an unverified user cannot reach any app feature until the phone is verified.
- **Emails:** welcome-on-signup only (no per-login alerts).
- **Uniqueness:** across ALL accounts (email + Google), enforced at the DB level.

Reuses existing infra rather than reinventing: OTP helpers in `backend/src/lib/otp.js`
(`generateOtp`/`hashOtp`/`verifyOtp`), the resend-cooldown/attempt-lockout pattern in
`backend/src/routes/family.js`, the `sendEmail` wrapper + HTML templates in
`backend/src/lib/email.js` (transport swapped Resend→SES, templates kept), the OTP
tunables in `backend/src/lib/config.js`
(`config.otp.*`), and the `API_URL`/`authHeader` helpers in
`frontend/src/services/api.js`.

---

## Implementation runbook (do in this order)

The safe sequence — each step is independently testable before moving on. Detailed
specs for each are in the numbered sections below.

**A. Foundations (can be done/tested locally with no AWS)**
1. Write the DB migration (§1); run it on the Supabase project; confirm columns/table exist.
2. Backend transport + helpers: swap `sendEmail`→SES and add `welcomeEmailHtml` (§2), add `lib/sms.js`, `lib/phone.js`. New deps: `@aws-sdk/client-sesv2`, `@aws-sdk/client-sns`, `libphonenumber-js`.
3. Backend routes: `routes/phone.js`, `routes/account.js`; mount in `server.js`; add the new limiters (§5). Set `OTP_MAX_PER_HOUR=2`, `OTP_TTL_MINUTES=10`.
4. Frontend: extend `AuthContext` (profile + welcome-email trigger), gate in `ProtectedRoute`, new `PhoneVerify` page, `services/account.js`, `/verify-phone` route.
5. **Local end-to-end test with SES/SNS disabled** — OTP + welcome print to the server log; walk the full gate flow, uniqueness, lockout, expiry (see Verification).

**B. AWS enablement (needed only for real SMS/email delivery)**
6. Create the least-privilege IAM role/user (§5) — `ses:SendEmail`, `sns:Publish`, `sns:SetSMSAttributes`.
7. SES: verify `evodev.site` (DKIM CNAMEs in Namecheap) + request production access (sandbox exit).
8. SNS: raise SMS spend limit / exit sandbox; start India DLT sender-ID + template registration (long lead time — start early).
9. Enable Supabase Auth CAPTCHA + rate limits in the dashboard.

**C. Ship**
10. Backend → EC2: `npm install`, set AWS env (role or keys + region; remove `RESEND_API_KEY`), `pm2 restart --update-env`.
11. Frontend → copy into the standalone `evodoc-frontend` repo, commit, push (Vercel auto-deploys).
12. Production smoke test; then retire Resend once SES delivery is confirmed.

---

## 1. Database (new migration `backend/supabase/add-phone-verification.sql`, also folded into `schema.sql`)

**`profiles`** — add columns:
- `phone text unique` — E.164, written ONLY on successful verification (NULL until then; Postgres allows many NULLs, so the unique constraint enforces one-account-per-verified-phone).
- `phone_verified boolean not null default false`
- `phone_verified_at timestamptz`
- `welcome_sent_at timestamptz` — idempotency guard for the welcome email.

No change needed to the `handle_new_user` trigger (phone stays NULL at creation).
Owner-can-select policy already exists, so the frontend can read `phone_verified`
directly via Supabase for the gate.

**`phone_verifications`** — new table, mirrors `connection_otps` (RLS enabled, **no
policies** → backend/service-role only; codes never reach any browser):
- `user_id uuid primary key references auth.users(id) on delete cascade` (one pending verification per user)
- `phone text not null` (the E.164 number being verified — the pending value)
- `otp_hash text not null`, `expires_at timestamptz not null`
- `attempts int not null default 0`, `send_count int not null default 1`, `last_sent_at timestamptz not null default now()`

## 2. Backend

**`lib/sms.js`** (new) — mirrors `email.js`: `smsEnabled()` + `sendSms({ to, message })`
via `@aws-sdk/client-sns` `PublishCommand` (Transactional message type). Returns
`{ sent:false, reason }` when AWS creds/region are absent (never throws), so local dev
works without AWS. New dep: `@aws-sdk/client-sns`.

**`lib/phone.js`** (new) — `normalizePhone(raw)` → validated E.164, defaulting to `+91`
for bare 10-digit input. Use `libphonenumber-js` (new dep) for correct parsing/validation.

**`routes/phone.js`** (new, mounted `/api/phone`, behind the auth wall):
- `POST /send-code { phone }` — normalize/validate; reject if caller already verified;
  pre-check no other profile has this phone verified (→ 409 "already linked to another
  account"); enforce resend cooldown + hourly cap (reuse `config.otp` + the
  `phone_verifications.last_sent_at`/`send_count` logic copied from family resend);
  `generateOtp`→`hashOtp`→upsert row; `sendSms` (dev: log code when SMS disabled).
- `POST /verify-code { code }` — phone read from the pending row (not the client);
  check exists/not-expired/attempts<max; `verifyOtp`; on success `update profiles set
  phone, phone_verified=true, phone_verified_at=now()` catching unique-violation 23505 →
  409, then delete the pending row.
- Reuse `generalLimiter`; optionally a small dedicated `phoneLimiter` in `lib/rateLimit.js`.

**`routes/account.js`** (new, mounted `/api/account`):
- `POST /welcome` — idempotent: if `profiles.welcome_sent_at` is NULL, send welcome
  email via `sendEmail` + new `welcomeEmailHtml` in `email.js`, then set
  `welcome_sent_at`. Safe to call on every login (dedupes server-side).

**`lib/email.js`** — add `welcomeEmailHtml({ name, appUrl })`, AND migrate the transport
from Resend to **AWS SES**: `sendEmail` now calls `@aws-sdk/client-sesv2`
`SendEmailCommand` (new dep) instead of Resend's REST API; `emailEnabled()` checks for
AWS region/creds + a configured `EMAIL_FROM`. All HTML template functions
(`otpEmailHtml`, `inviteEmailHtml`, `welcomeEmailHtml`) are unchanged. Reuses the same
AWS region/IAM being added for SNS. Resend is dropped entirely (family OTP + invite
emails now also go through SES).
**`server.js`** — mount the two new routers after the auth middleware.
**`config.js` / `.env.example`** — reuse `OTP_*` for phone OTP; document
`AWS_REGION` (SMS+SES-capable region, e.g. `ap-south-1`), and either an EC2 **IAM role**
(preferred, no keys — one role grants both SNS + SES) or
`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, plus optional `SMS_SENDER_ID`.
**Remove** `RESEND_API_KEY` (no longer used); keep `EMAIL_FROM` but it must now be a
**SES-verified** sender on `evodev.site` (e.g. `EvoDoc <noreply@evodev.site>`).

**Rate-limit / validity change (applies to BOTH family and phone OTP, since both read `config.otp`):**
- `OTP_MAX_PER_HOUR` default → **2** (max OTP sends per hour: caps family invites/resends per requester AND phone send-code/resend per user).
- `OTP_TTL_MINUTES` default → **10** (already 10; keep). A code is valid for 10 minutes.
- Change the defaults in `config.js` AND set them explicitly in `.env` / `.env.example` so the 2/hour + 10-min values are the source of truth on every environment.

## 3. Frontend

- **`context/AuthContext.jsx`** — also load the caller's `profiles` row (`phone_verified`,
  `full_name`) whenever the session changes; expose `profile` + `refreshProfile`. On the
  `SIGNED_IN` event, fire `sendWelcomeEmail()` once (backend dedupes) — this is the single
  place that covers both email and Google (Google returns via redirect with no form handler).
- **`components/ProtectedRoute.jsx`** — while session exists but profile is loading, show
  spinner; if `profile.phone_verified === false`, redirect to `/verify-phone`.
- **`pages/PhoneVerify.jsx`** (new) — authenticated page OUTSIDE the phone gate. Step 1:
  enter phone (default +91) → `sendPhoneCode`. Step 2: enter 6-digit code → `verifyPhoneCode`
  → `refreshProfile` → redirect to `/`. Resend w/ cooldown; handles already-linked / wrong /
  expired / locked errors. Reuse `Button`/`Field`/`inputClass`/`Alert`.
- **`services/account.js`** (new) — `sendPhoneCode`, `verifyPhoneCode`, `resendPhoneCode`,
  `sendWelcomeEmail`, using the `postJson`/`authHeader` pattern.
- **`App.jsx`** — add `/verify-phone` as a session-required route registered so it's
  reachable while unverified (not wrapped by the phone gate).

## 4. AWS / ops setup (outside code — prerequisites for real delivery)

**Shared:** one EC2 **IAM role** (preferred) granting both `sns:Publish` (+
`sns:SetSMSAttributes`) and `ses:SendEmail`; use an SMS+SES-capable region (`ap-south-1`).

**SMS (SNS):**
1. **SNS SMS sandbox / spend limit** — new accounts are capped to verified numbers; request a monthly SMS spend-limit increase to send to arbitrary numbers.
2. **India DLT registration (IMPORTANT)** — delivering OTP SMS to +91 numbers reliably
   requires a registered Sender ID + DLT transactional template with TRAI via the SNS
   console. Can take days; hard prerequisite for Indian delivery — flag early.
3. Set SMS type = **Transactional**.

**Email (SES):**
4. **Verify `evodev.site` in SES** — add SES's 3 DKIM CNAME records in Namecheap
   (coexist fine with the existing Resend records; those can be removed once Resend is retired).
5. **Exit the SES sandbox** — request production access, otherwise SES can only email
   verified addresses. Usually approved within ~24h.
6. Verify the `EMAIL_FROM` sender/domain in SES.

## 5. Security & rate-limit hardening (all endpoints)

Rate limiting is centralized in `backend/src/lib/rateLimit.js` (express-rate-limit, keyed
per user id, IP fallback; `app.set('trust proxy', 1)` so it works behind Nginx). Current
vs. target for every route:

| Endpoint | Auth | Current limit | Change |
|---|---|---|---|
| `GET /health` | public | none | add a loose IP limit (e.g. 60/min) |
| `GET /api/share/:token[/files/:id]` | public | shareLimiter 60/5min IP | keep |
| `POST /api/ai/extract-medications` | user | 5/hr + 25/day | keep |
| `POST /api/files` (upload) | user | uploadLimiter 30/15min | keep |
| `GET /api/files/:id/view`, `/usage` | user | generalLimiter 300/15min | add moderate `viewLimiter` (e.g. 120/15min) |
| `POST /api/family/invite` `/resend-code` | user | general + OTP 2/hr | keep (2/hr from the config change above) |
| `POST /api/family/confirm-code` `/:id/relation` | user | general | keep (attempt-lockout already guards confirm) |
| `POST /api/push/*` | user | general | keep |
| **`POST /api/phone/send-code`** (new) | user | — | new `phoneLimiter` (e.g. 5/15min) + OTP 2/hr + resend cooldown |
| **`POST /api/phone/verify-code`** (new) | user | — | new `phoneVerifyLimiter` (e.g. 10/15min) + attempt-lockout |
| **`POST /api/account/welcome`** (new) | user | — | strict limiter (e.g. 3/hr); idempotent via `welcome_sent_at` |

Other security steps to include in this work:
1. **Supabase Auth abuse protection (config, not code):** login/signup go straight to
   Supabase, so enable Supabase's built-in **auth rate limits + CAPTCHA (hCaptcha/Turnstile)**
   in the dashboard to blunt credential-stuffing on the one surface our own limiter can't see.
2. **Least-privilege IAM:** the EC2 role grants ONLY `ses:SendEmail`, `sns:Publish`,
   `sns:SetSMSAttributes` — not broad AWS access; prefer the instance role over static keys.
3. **New OTP/phone tables:** confirm `phone_verifications` has RLS enabled with **no
   policies** (backend/service-role only), like `connection_otps`; `profiles.phone` never
   exposed to other users (owner-select policy already scopes it).
4. **Verify-code takes the phone from the server-side pending row, never the client**, so a
   caller can't verify a number they didn't request a code for.
5. **Validated identifiers only in filter strings:** all interpolated ids in family/phone
   `.or()`/`.eq()` filters come from the JWT (`req.user.id`) or are `UUID_RE`-checked first
   (audit `family.js` + new `phone.js`).
6. **Rate-limit store note:** limiters are in-memory (fine for the single PM2 fork). If the
   backend is ever scaled to multiple processes/instances, move to a shared store (Redis) so
   limits are enforced globally — documented as a future item, not built now.
7. Existing hardening already in place and kept: helmet headers (nosniff/HSTS, share-viewer
   CORP/frame exceptions), CORS allowlist, opaque 500s, 1 MB JSON body cap, multer size +
   magic-byte validation, HMAC-hashed constant-time OTPs, no-enumeration responses.

## Verification

- **Local (no AWS needed):** backend logs the OTP to console when SMS is disabled → walk
  the whole flow: new signup → forced to `/verify-phone` → enter phone → read code from
  server log → verify → land on dashboard.
- **Hard gate:** unverified account cannot open `/files`, `/family`, etc. (always bounced to `/verify-phone`).
- **Uniqueness:** verify a number on account A, attempt the same number on account B → 409, and the DB unique index blocks a race at commit time.
- **Welcome email:** new signup → exactly one welcome email in Resend; second login → none (idempotent).
- **OTP robustness:** wrong-code lockout at `OTP_MAX_ATTEMPTS`, expiry after `OTP_TTL_MINUTES` (10 min), and the **2/hour** send cap — confirm the 3rd send within an hour is rejected for both family invites and phone codes.
- **New rate limits:** hit `/api/phone/send-code`, `/verify-code`, `/api/account/welcome`, and `/health` past their caps and confirm HTTP 429 with the expected message; confirm the per-user limiters key correctly behind Nginx (real client IP, not the proxy's).

## Deployment

- Run `add-phone-verification.sql` in the (new Mumbai) Supabase SQL editor.
- Backend: `npm install` (`@aws-sdk/client-sns`, `@aws-sdk/client-sesv2`, `libphonenumber-js`), set env (IAM role or keys + region; remove `RESEND_API_KEY`), `pm2 restart evodoc-backend --update-env`.
- Frontend: copy changed files into the standalone `evodoc-frontend` repo, commit, push (Vercel auto-deploys).
- Complete SNS sandbox-exit + India DLT registration (SMS) and SES domain-verification + sandbox-exit (email) before relying on real delivery.
- Once SES email is confirmed working, retire the Resend account and its DNS records.

## Out of scope (noted, not built)

- Changing/re-verifying a phone after initial verification.
- Per-login security-alert emails (user chose welcome-only).
- Storing the phone hashed (kept plaintext E.164, consistent with email, required for the uniqueness constraint).
