# EvoDoc Security Model
Layer-by-layer description of every security control, the reasoning behind it,
and the honest list of remaining gaps to close before handling real patient
data.
------------------------------------------------------------------------------
## Design principles
1. **The browser is untrusted.** No secret of any kind ships to the frontend;
   every check the frontend performs is repeated (or originally enforced) by
   the backend or the database.
2. **Defense in depth.** Ownership is enforced at least twice on every path
   (application check + database RLS; for storage, path check + storage policy).
3. **Least privilege.** The powerful service-role key is used in exactly one
   place (public share streaming) where the viewer legitimately has no
   identity — and only *after* explicit token validation.
4. **Fail identically.** Probing responses (share tokens) are uniform so an
   attacker learns nothing from the difference between "wrong", "expired",
   and "revoked".
## Layer 1 — Authentication
- Supabase Auth (email + password).Passwords are hashed by Supabase (bcrypt);
  the application never sees or stores them.
- Sessions are JWTs, auto-refreshed by `supabase-js`; `AuthContext` tracks the
  session and `ProtectedRoute` blocks all private pages without one.
- **Every** `/api/*` backend route (except public share routes) sits behind
  middleware that validates the bearer JWT with `auth.getUser()` — invalid or
  absent tokens get `401` before any handler runs.
- **Session storage (2026-07-14):** the Supabase browser client
  (`frontend/src/lib/supabase.ts`) uses a custom **in-memory** storage
  adapter instead of the `localStorage` default. `localStorage` and
  `sessionStorage` are both readable by any script running on the page, so a
  single XSS bug — anywhere on the site, in any dependency — could previously
  read out a live access + refresh token pair and replay it indefinitely.
  Keeping the session in a plain JS module variable means it only exists for
  the lifetime of the tab and is never written to a browser storage API an
  injected script could read.
  **Trade-off:** a full page reload or closing the tab clears the session, so
  the user is signed out and sent to `/login`. This isn't a new code path —
  `lib/store.js` already redirects to `/login` on any missing session — it
  now just also fires on reload, not only on an actual sign-out. Google OAuth
  and password-reset/magic-link flows are unaffected: both hand the session
  back via the URL on that page load (`detectSessionInUrl: true`), before
  anything could be lost.
  HttpOnly cookies were not used because this app queries Supabase tables
  directly from the browser (`lib/api.js` calls `supabase.from(...)`
  everywhere, relying on RLS) rather than through a server-side proxy — the
  JWT has to be readable by `supabase-js` in the page to attach to those
  requests, so it can't be hidden from JS entirely without first rebuilding
  every direct client query into a backend endpoint.
## Layer 2 — Database (Row Level Security)
RLS is enabled on all six tables. Policies grant SELECT/INSERT/UPDATE/DELETE
only where `user_id = auth.uid()` (junction table `shared_link_files` checks
ownership of the *parent link and the file* via `EXISTS`). Because `auth.uid()`
derives from the cryptographically signed JWT, no client-supplied value can
impersonate another user — compromising a `profiles` row changes nothing.
There are deliberately **no anonymous policies at all**: an unauthenticated
Supabase client can read nothing, list nothing, guess nothing.
Extra constraints as backstops: token uniqueness, expiry CHECKs
(future-dated, ≤30 days), category/source enums, `medical_files.storage_path`
must begin with the owner's own UUID (enforced in the insert policy).
## Layer 3 — Storage
- Single **private** bucket; public URLs don't exist.
- Object keys are `<user_id>/…`; four `storage.objects` policies compare the
  first folder segment with `auth.uid()` for read/write/update/delete.
- The bucket accepts only `application/octet-stream` — it physically cannot
  hold un-encrypted uploads (the real MIME type lives in `medical_files`).
- Path traversal is a non-issue: storage keys are a flat namespace (`..` is a
  literal name), and the RLS folder check still evaluates the true first segment.
## Layer 4 — Application-level encryption (AES-256-GCM)
Everything in the bucket is ciphertext, sealed by the backend before upload:
- Per-file random 256-bit data key; data key wrapped by the master key
  (envelope encryption). Format: `EVD1 | wrapIv | wrapTag | wrappedDEK | iv |
  tag | ciphertext`.
- GCM authentication tags at both layers ⇒ tampering with a single byte makes
  decryption fail loudly instead of yielding corrupted plaintext.
- The master key (`ENCRYPTION_MASTER_KEY`, 64 hex chars = 256 bits) exists
  only in `backend/.env`. It is never sent anywhere, never logged, never
  stored in the database.
- Consequence to respect: **lose the master key and every encrypted file is
  gone forever.** Back it up like a vault combination.
What this buys beyond Supabase's own at-rest encryption: a leaked storage
credential, a misconfigured bucket policy, or a stolen database backup yields
only unreadable blobs.
## Layer 5 — Sharing
- Tokens: 24 random bytes → 48 hex chars → 192 bits of entropy, generated by
  PostgreSQL (`gen_random_bytes`), never client-supplied. Brute-force
  enumeration is computationally absurd (~10⁵⁷ expected guesses).
- The junction table stores **no URLs and no credentials** — only which files
  a link grants.
- Every public request re-validates `token AND NOT revoked AND expires_at >
  now()` before a single byte is decrypted ⇒ **revocation is instantaneous**,
  including for a page someone already has open (the next file request dies).
- Format pre-check (`^[0-9a-f]{48}$`) rejects garbage before touching the DB;
  parameterized queries only, so SQL injection has no surface.
- Unknown, expired, and revoked tokens return byte-identical responses.
- Streaming responses carry `Referrer-Policy: no-referrer` and
  `Cache-Control: private, no-store`.
## Layer 6 — AI integration
- `GEMINI_API_KEY` is server-side only; the browser bundle contains no AI SDK.
- Callers must present a valid JWT; stored-file extraction additionally
  requires the path to start with the caller's own UUID **and** downloads with
  the caller's JWT (RLS enforced a second time).
- The prompt is fixed server-side ("extract only what is written; never
  invent"), the response is schema-constrained JSON at temperature 0, and a
  sanitizer enforces string caps and `HH:MM` validity before anything reaches
  the UI.
- Human-in-the-loop: AI output only ever populates *draft* forms; the user
  must review and explicitly save each reminder.
## Layer 7 — Secrets hygiene
- All keys live in `.env` files that are gitignored in both folders.
- The frontend `.env` contains only publishable values (Supabase's security
  model assumes the anon key is public; RLS is the actual barrier).
- The backend warns loudly at startup about any missing or placeholder key.
- CORS on the backend is an explicit origin allow-list.
## Layer 8 — Browser security headers & CSP (2026-07-14)
Both the Next.js frontend and the Express backend send hardened headers by
default; every deviation from "deny everything" is documented at the point
it's applied.
**Frontend (`frontend/src/proxy.ts` + `next.config.ts`):**
- A fresh CSP is built per request in `proxy.ts` (Next 16's middleware
  convention) with a random nonce, and applied to every route except static
  assets and `heart-embed.html`.
- `script-src 'self' 'nonce-<random>' 'strict-dynamic'` — **no
  `'unsafe-inline'`.** The one inline `<script>` in the app (the JSON-LD
  block in `app/layout.tsx` and `app/evodoc/EvoDocPage.js`) reads the nonce
  from the `x-nonce` request header `proxy.ts` sets and passes it via the
  `nonce` prop; anything else injected via XSS has no nonce and won't run.
  In dev only, `'unsafe-eval'` is added (gated on `NODE_ENV`) because React's
  dev-mode debugging tools call `eval()`; React never does in production, so
  this never reaches a real deployment.
- `connect-src`/`img-src`/`frame-src` are scoped to exactly `self`, the
  configured `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_SUPABASE_URL` — not a
  wildcard. `frame-src` includes the API origin because `/share/[token]`
  embeds a PDF preview from the backend in an `<iframe>` — the only iframe
  this app renders.
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` on every route — this
  site is never meant to be framed by anyone. `next.config.ts` no longer sets
  its own `X-Frame-Options` to avoid two conflicting header values; `proxy.ts`
  is the single source of truth. The deprecated `X-XSS-Protection` header was
  removed (modern browsers ignore it; the ones that don't have known
  vulnerabilities *in* the legacy filter it enables).
- `heart-embed.html` is excluded from `proxy.ts`'s matcher entirely — it's a
  decorative widget meant to be embedded by third-party sites, so it keeps
  its own narrower header set in `next.config.ts` (nosniff only).
- **Known trade-off:** because the nonce must be generated per request,
  every page that renders through the root layout now opts out of static
  generation (`headers()` forces dynamic rendering — visible in `next build`
  output as `ƒ` instead of `○` for every app route). This is the standard
  cost of a nonce-based CSP in Next.js; there is no static alternative that
  keeps `script-src` free of `'unsafe-inline'`.
- A `nonce="" ` vs the real nonce value shows up as a **benign** hydration
  warning in the dev console — browsers deliberately strip the `nonce`
  attribute from the DOM after using it (so an injected script can't read a
  legitimate nonce off a sibling tag), which is exactly what this warning is
  reporting. This is the same behavior Next.js's own CSP documentation
  describes; it doesn't affect script execution.
**Backend (`backend/src/server.js` + `backend/src/routes/share.js`):**
- `helmet()` runs with a default-deny CSP (`default-src 'none';
  frame-ancestors 'none'`) and `frameguard: { action: 'deny' }` on every
  route. The API only ever returns JSON or a decrypted file, never HTML, so
  there is nothing here that legitimately needs to execute script or be
  framed.
- `crossOriginResourcePolicy: 'cross-origin'` stays enabled globally — every
  route is called from a different origin (the frontend) via `fetch()`, and
  the default same-origin CORP would make the browser discard every response
  regardless of what CORS allows.
- **One deliberate exception:** `GET /api/share/:token/files/:fileId`
  streams a decrypted document that `/share/[token]` on the frontend embeds
  cross-origin via `<img>`/`<iframe>` for inline preview. Before that route
  responds it calls `res.removeHeader('X-Frame-Options')` and sets
  `Content-Security-Policy: frame-ancestors <FRONTEND_ORIGIN values>` —
  scoped to the exact origins in the `FRONTEND_ORIGIN` env var (shared with
  the CORS allow-list via `backend/src/lib/config.js`), not a wildcard.
  **Why CSP instead of `X-Frame-Options` here:** `X-Frame-Options` has no
  syntax for "frameable by exactly these N origins" — its only per-origin
  form, `ALLOW-FROM`, was removed from Chrome and Firefox years ago. CSP's
  `frame-ancestors` directive supports an explicit origin list, so it
  replaces `X-Frame-Options` on this one response instead of widening the
  DENY-by-default policy for the whole API.
- `X-Content-Type-Options: nosniff` and `helmet`'s default `X-XSS-Protection:
  0` (the modern replacement for the deprecated `1; mode=block` value —
  explicitly disabling the legacy filter, which itself had exploitable bugs)
  apply everywhere, including the share-file response, since the file's real
  `Content-Type` is always set explicitly and nosniff only prevents the
  browser from second-guessing it.
## Known gaps — close these before real-world health data
Listed honestly, in priority order:
1. **Share tokens are stored in plaintext** in `shared_links.token`. Storing
   `sha256(token)` instead (show the raw token once at creation) would mean
   even a database leak exposes no usable links.
2. **No HTTPS locally** — fine on localhost, mandatory the moment the app is
   hosted. Deploy behind TLS only.
3. **Auth hardening for production**: re-enable email confirmation, enforce a
   server-side password policy, enable leaked-password protection, offer MFA.
4. **No audit log** of share accesses. An append-only access log (when, which
   link, hashed IP) is both a security forensic tool and a user-facing feature.
5. **No notification delivery** for reminders (display-only today) — not a
   security gap, but worth stating.
6. **Regulatory reality**: real patient data typically triggers HIPAA/GDPR
   obligations (BAAs, data-processing agreements, retention policies). That is
   a legal workstream, not just a technical one.
## Security verification performed
An automated end-to-end suite (run during development) verified: signup/login,
profile auto-creation, encrypted upload, **ciphertext-at-rest check** (raw
object begins with `EVD1`, contains no plaintext), owner decryption round-trip,
anonymous share view, **instant revocation**, uniform invalid-token responses,
authenticated-only AI access, and unauthenticated rejection (`401`) on every
private route. Tamper detection was verified by bit-flipping a sealed blob and
confirming decryption refuses.