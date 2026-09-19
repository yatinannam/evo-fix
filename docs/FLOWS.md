# EvoDoc — Step-by-Step Feature Flows

Every major user action in the app, broken down into the exact sequence of checks and operations that happen — client to server to database. Written for anyone who needs to understand *how* a feature actually works, not just what it does.

---

## 1. Sign-up / Login — Email & Password

1. User enters email + password on the **Signup** page and submits.
2. Frontend calls `supabase.auth.signUp({ email, password, options: { data: { full_name } } })` — this goes **directly** to Supabase, not through the Express backend.
3. Supabase creates a row in its internal `auth.users` table.
4. A Postgres trigger (`handle_new_user`, fires `AFTER INSERT ON auth.users`) automatically inserts a matching row into `public.profiles` (id, full_name, email) — this happens instantly and server-side, so the app never has to manually create a profile.
5. If email confirmation is required (Supabase project setting), no session is returned yet — the UI shows "check your inbox" and the user must click the confirmation link before logging in.
6. If no confirmation is required, Supabase returns a session (JWT access token + refresh token) immediately and the user is logged in.
7. On subsequent visits: `supabase.auth.signInWithPassword({ email, password })` — Supabase verifies the password hash and returns a fresh session.
8. The frontend's `AuthContext` listens to `supabase.auth.onAuthStateChange` and keeps `session`/`user` in React state; `ProtectedRoute` components redirect to `/login` if there's no session.
9. Every authenticated API call (to the Express backend) attaches `Authorization: Bearer <access_token>` — the backend validates this token via `getUserFromToken()` on **every** `/api/*` request (`server.js` middleware) before any route handler runs.

---

## 2. Sign-up / Login — Google OAuth

1. User clicks **"Continue with Google"** on Login or Signup.
2. Frontend calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
3. Browser is redirected to **Supabase's** auth endpoint, which redirects to **Google's** consent screen (Supabase — not the app's own backend — holds the Google Client ID/Secret, configured in Supabase Dashboard → Authentication → Providers → Google).
4. User approves access on Google's page.
5. Google redirects back to **Supabase's** callback URL (`https://<project>.supabase.co/auth/v1/callback`) with an auth code.
6. Supabase exchanges the code with Google, creates/matches an `auth.users` row (same trigger as above auto-creates the `profiles` row, pulling `full_name`/`email` from Google's profile data), and issues a session.
7. Supabase redirects the browser to the app's **Site URL** (configured in Supabase → Authentication → URL Configuration — must match the live frontend domain exactly, e.g. `https://evodoc-frontend-wtee.vercel.app`) with the session token in the URL fragment.
8. The Supabase JS client (`detectSessionInUrl: true`) picks up the token from the URL automatically and stores the session — same `AuthContext` state as the email/password flow from here on.
9. **Key point:** the app's own backend is never involved in this exchange — Google only ever talks to Supabase's callback, never to `api.evodev.site`.

---

## 3. File Upload (Document / Prescription / Lab Report)

1. User picks a file (PDF/JPEG/PNG/WEBP/HEIC) on the **Files** page and selects a document category.
2. **Client-side pre-check** (`services/files.js`): file type must be in the allowed MIME set, and size must be ≤ 20 MB — this is a fast UX guard only, never trusted as the real security boundary.
3. Frontend builds a `multipart/form-data` request (`file`, `category`, optional `for_user` if uploading on behalf of a connected family member) and `POST`s to `${API_URL}/api/files` with the user's bearer token.
4. **Backend auth wall** (`server.js`) validates the token first — request never reaches the route handler without a valid session.
5. **Multer** receives the file into memory (not disk), enforcing the same size/type limits server-side (`fileFilter`, `config.upload.multerLimitBytes`) — this is the real boundary; the client check above can't be trusted alone.
6. **Content validation** (`pdfValidation.js`), type-specific:
   - **PDF:** magic-byte check (must start with `%PDF-`), size ≤ `MAX_PDF_SIZE_MB`, must parse with `pdf-lib`, must **not** be encrypted/password-protected, and page count must be ≤ `MAX_PDF_PAGES`. Any failure returns a specific 4xx (413 too large, 415 wrong format, 422 corrupt/encrypted/too many pages) — never a generic 500.
   - **Image:** size ≤ `MAX_IMAGE_SIZE_MB`.
7. **Family delegation check** (if uploading for a connected member): the `for_user` id must be a valid UUID, and there must be an `accepted` row in `family_connections` linking the caller and that user — otherwise 403. If it passes, the file's owner becomes the *target* user, not the uploader.
8. **Storage quota check** (`storageQuota.js`): sums `size_bytes` across the target owner's existing `medical_files` rows and rejects (413) if adding this file would exceed `USER_STORAGE_QUOTA_MB` — checked against the target owner, so uploading for family counts against *their* quota, not the uploader's.
9. **Encryption** (`crypto.js`), only after every check above passes:
   - Generate a fresh random 256-bit **Data Encryption Key (DEK)** for this one file.
   - Encrypt the file bytes with the DEK using **AES-256-GCM** (produces ciphertext + auth tag).
   - Wrap (encrypt) that DEK itself with the server's master key (`ENCRYPTION_MASTER_KEY`, also AES-256-GCM) — this is envelope encryption, so the master key is never used to encrypt file content directly, only to protect per-file keys.
   - Concatenate everything into one self-describing sealed blob: `magic("EVD1") | wrapIv | wrapTag | wrappedDEK | iv | tag | ciphertext`.
10. The sealed blob is uploaded to the private Supabase Storage bucket at path `<owner_id>/<random-uuid>-<sanitized-filename>.enc`, using the **caller's own JWT** (not the admin key) — so Storage's Row Level Security still applies end-to-end. Content-Type is stored as `application/octet-stream` since the bucket only ever holds ciphertext.
11. A matching row is inserted into `medical_files` (owner, real filename, **real** MIME type, storage path, size, category). If this DB insert fails after the storage upload succeeded, the just-uploaded object is deleted to avoid an orphaned ciphertext blob with no metadata.
12. Response returns the new file row to the frontend, which refreshes the file list.

---

## 4. Viewing / Previewing an Uploaded File (Owner)

1. User clicks a file to preview.
2. Frontend calls `GET /api/files/:id/view` with the bearer token.
3. Backend queries `medical_files` **using the caller's JWT** (not admin) — Row Level Security means the query only returns a row if the caller is the owner (or has family access via policy), so unauthorized ids simply come back empty → 404, no separate permission-check code needed.
4. The ciphertext blob is downloaded from Storage (again, with the caller's JWT — RLS-scoped).
5. Backend decrypts in memory: unwraps the DEK using the master key, verifies the wrap's auth tag, then decrypts the file content with the DEK and verifies its auth tag — any tampering at either layer causes decryption to fail loudly rather than silently returning corrupted data.
6. Plaintext bytes are streamed back to the browser with the **real** `Content-Type`, `Content-Disposition: inline`, and `Cache-Control: private, no-store` (so browsers/proxies never cache decrypted health data).
7. Frontend wraps the response blob in a temporary local `URL.createObjectURL()` for display — the decrypted bytes never touch server disk and the object URL is local to the browser tab.

---

## 5. Deleting a File

1. User clicks delete on a file they own.
2. Frontend removes the storage object directly via `supabase.storage.from(bucket).remove([path])` (using the logged-in user's own session — RLS ensures they can only remove their own paths).
3. Frontend then deletes the `medical_files` row via a normal Supabase table delete (again RLS-scoped to the owner).
4. No backend route is involved in deletion — both operations go straight to Supabase from the client, protected entirely by RLS policies (only the owner's policies allow delete; family members with view/add access cannot delete each other's records).

---

## 6. AI Prescription Reading (Auto-Fill Reminders)

1. User uploads a prescription photo/PDF (or picks an already-uploaded file) on the reminder-creation screen.
2. Frontend `POST`s to `/api/ai/extract-medications`, either as a fresh multipart upload or as JSON `{ storage_path }` referencing an existing file.
3. **If referencing an existing file:** the backend looks it up using the **caller's JWT** — RLS means the row only comes back if the file belongs to the caller or a connected family member; otherwise 404 (never leaks existence of files you can't see).
4. **Markdown cache check** (PDF only): if this exact file was already converted to Markdown before, the cached text is reused — skips re-downloading and re-converting the file entirely, and skips straight to extraction.
5. **Cache miss / no existing file:** the file's ciphertext is downloaded (via the caller's JWT) and decrypted in memory (same AES-256-GCM unwrap as the view flow above).
6. **Preprocessing branch** — this is a cost/accuracy optimization:
   - **Text-based PDFs** are converted to Markdown text locally (`pdfToMarkdown.js`) — cheap and precise, no image tokens needed. The Markdown is cached (`ai_markdown_cache` table) for next time, then sent to Gemini as plain text.
   - **Scanned/handwritten documents** (or any PDF where text conversion fails/looks unreliable) fall back to the full **vision** pipeline — the raw image/PDF bytes go to Gemini directly.
7. **Gemini extraction:** the backend calls Google's Gemini API (server-side only — the API key never reaches the browser) with a prompt asking it to extract medication name, dosage, frequency, and schedule from the document.
8. Gemini's structured response is returned to the frontend as a **suggested** draft — nothing is saved to the database yet.
9. User reviews the suggested medications, edits anything wrong, and explicitly confirms before a `reminders` row is actually created. The AI never has write access to the database; it only produces text the human approves.
10. Error handling: rate-limit responses from Gemini (429/quota) are surfaced as a friendly "wait a minute" message rather than a raw API error; missing/invalid API keys are reported clearly to whoever is running the server (not exposed to end users as a stack trace).

---

## 7. Secure Share Links (Doctor Access, No Account Needed)

1. User selects one or more files (or a whole "health event" bundle) and picks an expiry window (1 hour – 7 days) plus an optional label.
2. Frontend inserts a row into `shared_links` (owner id, label, expiry timestamp) directly via Supabase (RLS-scoped to the logged-in user) — the database auto-generates a random 48-character hex **token** as the link's secret identifier (never anything guessable like a sequential id).
3. Frontend inserts junction rows into `shared_link_files` linking that link to each selected file id.
4. If the junction insert fails, the just-created link row is deleted immediately — no dangling, fileless share link is ever left behind.
5. The shareable URL is `https://<frontend-domain>/share/<token>` — this route is public (no login), handled by the frontend's `SharedView` page and the backend's separate `/api/share` router, which is registered **before** the authentication wall in `server.js` (it doesn't need a user session — the token itself is the credential).
6. **When the doctor opens the link:**
   - Frontend calls `GET /api/share/:token`.
   - Backend validates the token format (48 hex chars), then looks up `shared_links` using the **admin** client (this is the one place the service-role key matters — there's no logged-in user to scope RLS to), checking `revoked = false` **and** `expires_at` is still in the future, in the same query.
   - Unknown, expired, and revoked tokens all return the **identical** "not available" response — no way for an outsider to distinguish "wrong token" from "your invite was revoked."
   - On success, only a manifest (file names, types, categories — **no storage paths**) is returned; the actual file bytes are fetched one at a time on demand.
7. **When the doctor opens a specific file:**
   - `GET /api/share/:token/files/:fileId` — token is **re-validated from scratch** on every single file request (not cached), so revoking a link cuts off access to files the doctor may already have "listed" instantly, mid-session.
   - The requested file id must be one of the ids actually attached to that link — even if the doctor guesses another file's id, it's rejected.
   - The ciphertext is downloaded (admin client) and decrypted the same way as the owner-preview flow (AES-256-GCM unwrap + decrypt), then streamed with `Cache-Control: private, no-store` and `Referrer-Policy: no-referrer` (prevents the URL/content from being cached or leaked via referrer headers to any third party).
8. **Revoking:** owner flips `revoked = true` on the `shared_links` row (via a normal Supabase update, RLS-scoped) — the very next request to that token (manifest or file) fails immediately, since step 6 re-checks `revoked = false` every time.

---

## 8. Family Connection — OTP-Verified Account Linking

This is the most security-sensitive non-file flow in the app, so every step is deliberately paranoid about not leaking whether an account exists.

1. **Sender** (person A) enters person B's email on the **Family** page and clicks "Send code."
2. Frontend calls `POST /api/family/invite { email }`.
3. **Rate limit check:** backend counts how many invites person A has sent in the last hour (via the audit log) and rejects with 429 if over the cap — prevents using this endpoint to mass-probe email addresses.
4. Backend looks up whether `email` belongs to a real `profiles` row.
5. **Uniform response, always:** whether the account exists, belongs to the sender themselves, or already has a connection in progress, the API returns the **exact same** generic message ("if that address belongs to an account, we've emailed them a code") and a connection id. This is the anti-enumeration design — an attacker fishing for which emails have EvoDoc accounts learns nothing from the response.
   - If there's genuinely no match (or it's a duplicate/self-invite), a **throwaway** connection id is returned that will simply never succeed at the next step — no real row is created.
6. **If the account is real:** a `family_connections` row is created with status `code_pending` (deliberately **not** visible to the recipient yet — a database RLS policy explicitly blocks the recipient from seeing `code_pending` rows, so they can't peek or self-accept before the sender proves they have the code).
7. A random numeric code (`OTP_LENGTH`, default 6 digits) is generated, **HMAC-SHA256 hashed** (never stored in plaintext), and saved in `connection_otps` with an expiry (`OTP_TTL_MINUTES`) — this table has **Row Level Security enabled with zero policies**, meaning literally no client (not even the account owner) can read it directly; only the backend's service-role key can touch it.
8. The **plaintext** code is emailed to the **recipient** (person B) via Resend, using an HTML template. (In non-production environments without an email key configured, the code is logged to the server console instead, purely for local development.)
9. **Person B reads the code out to Person A** (out of band — phone call, in person, chat) — this is the actual "proof of connection consent" mechanism: it demonstrates B knowingly wants to link, without B ever touching the app yet.
10. **Person A enters the code** they were told, and the frontend calls `POST /api/family/confirm-code { connection_id, code }`.
11. Backend checks: caller must be the original sender, connection must still be `code_pending`, the stored code must not be expired, and the attempt count must be under `OTP_MAX_ATTEMPTS` (each wrong guess increments a counter and is logged; too many wrong attempts locks the code out entirely, requiring a fresh resend).
12. On a correct code (constant-time comparison, so response timing can't leak partial matches): the connection flips to status `pending` (now finally visible to the recipient via RLS), the one-time code row is deleted (single-use), and every step is written to an append-only `connection_audit_log`.
13. A best-effort notification email is sent to the recipient letting them know an invitation is now waiting for them in-app.
14. **Recipient's side:** Person B logs into EvoDoc, sees the pending invitation on their **Family** page, and clicks Accept or Decline — this direct table update (`family_connections.status = 'accepted'/'declined'`) is itself RLS-guarded so the recipient can only transition a row that is *already* `pending` (never a `code_pending` one, closing off any client-side attempt to skip the code step).
15. **Once accepted**, both people can now view each other's records and add documents/readings/reminders **for** each other (checked via the `accepted` status filter you saw in the upload flow, step 7 above) — but only the true owner of a record can delete or share it.
16. **Resending a code:** subject to a cooldown (`OTP_RESEND_COOLDOWN_SECONDS`) and a total send cap (`OTP_MAX_PER_HOUR` for that connection) — prevents spamming the recipient's inbox.

---

## 9. Medication Reminders & Push Notifications

1. User creates a reminder manually, or via the AI auto-fill flow (see #6) — either way, once confirmed, a row is written to the `reminders` table (medication name, dosage, frequency, `times_of_day` array, `is_active`).
2. **Enabling notifications (one-time, per device):** the browser requests permission, generates a Web Push subscription (endpoint + encryption keys) using the server's **VAPID public key** (fetched from `GET /api/push/public-key`), and `POST`s the subscription to `/api/push/subscribe`, which upserts it into `push_subscriptions` keyed by endpoint (re-subscribing the same device/browser never creates duplicates).
3. **The scheduler** (runs continuously inside the same Node process, started by `startReminderScheduler()` in `server.js`) ticks every 20 seconds:
   - Computes the current `HH:MM` in the configured timezone (`REMINDER_TIMEZONE`).
   - A "last fired minute" guard ensures each distinct minute is only processed **once**, even though the tick runs 3x per minute — this is what prevents duplicate notifications from a fast poll loop.
   - Queries all **active** reminders whose `times_of_day` array contains the current minute.
   - For each due reminder, sends a push notification (title, dosage, a stable `tag` so re-firing the same reminder in the same minute **replaces** rather than stacks a duplicate notification) to every registered device for that user via `sendPushToUser()`.
4. If push isn't configured (missing VAPID keys), the scheduler logs a warning and stays idle — it never crashes the server, it just silently does nothing until configured.
5. **Note on hosting:** because this scheduler lives inside the long-running Node process (not a serverless function), it only fires while the EC2 instance is actually running — stopping the instance pauses reminders for that window.

---

## 10. Health Readings (Vitals Tracking)

1. User logs a reading (blood sugar, blood pressure, weight, heart rate, temperature, or oxygen level) with a value and timestamp.
2. This is a direct Supabase table write from the frontend (`health_readings` table) — no backend route involved, since there's no file content to encrypt and no cross-user delegation logic beyond what RLS already enforces (owner, or an `accepted` family connection, per the table's policies).
3. Historical readings and per-vital trend charts are rendered by querying the same table, filtered by reading type and ordered by timestamp — again straight from the frontend via the Supabase client, RLS-scoped to whichever person's records the viewer is allowed to see (self, or a connected family member).

---

## Cross-Cutting Patterns Worth Noting

- **Two Supabase trust levels, used deliberately:** the frontend and most backend routes use the caller's own JWT (`supabaseForUser`), so **Row Level Security is the actual enforcement mechanism** for almost everything. The **service-role/admin key** (`supabaseAdmin`) is used only in the few places where there is no logged-in user to scope to — public share-link access, and the family-invite/OTP tables that must be completely unreadable to any client.
- **Encryption is envelope-style, per-file:** every file gets its own random DEK; only the DEK is protected by the shared master key. Losing/rotating the master key would be catastrophic (nothing decrypts), but a leak of one file's DEK doesn't expose any other file.
- **Validation always happens server-side, never trusts the client:** file type/size/page-count checks, family-connection checks, and quota checks all re-run on the backend even though the frontend also does lightweight versions for instant UX feedback.
- **Uniform responses to prevent enumeration:** both the family-invite flow and the share-link flow are designed so that "doesn't exist," "expired," and "not authorized" all look identical from the outside — an attacker can't use error message differences to map out valid accounts, files, or links.
