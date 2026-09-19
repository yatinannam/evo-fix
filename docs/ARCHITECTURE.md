# EvoDoc Architecture

Technical reference for developers: components, data flows, database schema,
and the backend API.

---
## 1. System overview
```
┌─────────────────────┐         ┌──────────────────────────┐
│  FRONTEND (browser) │         │  BACKEND (Node/Express)  │
│  React 19 + Vite    │────────▶│  :4000                   │
│  :5173              │  HTTPS/  │                          │
│                     │  JSON   │  • JWT check on /api/*   │
│  holds NO secrets   │         │  • AES-256-GCM seal/open │
└──────────┬──────────┘         │  • Gemini calls          │
           │                    │  • share streaming       │
           │ supabase-js        └────────────┬─────────────┘
           │ (anon key + user JWT)           │ anon key + user JWT
           │                                 │ service-role key (share routes only)
           ▼                                 ▼
┌──────────────────────────────────────────────────────────┐
│  SUPABASE                                                │
│  • Auth (email/password, JWT issuance)                   │
│  • PostgreSQL — 6 tables, RLS on all of them             │
│  • Storage — private bucket, ciphertext only             │
└──────────────────────────────────────────────────────────┘

External: Google Gemini (backend-only) · NLM RxTerms autocomplete (frontend, public API)
```

**Division of labor**

- The **frontend** talks *directly* to Supabase for everything RLS can protect
  by itself: auth, metadata CRUD (files list, bundles, reminders, share-link
  rows). It talks to the **backend** for everything that needs a secret:
  file bytes (encryption), AI, and public share access.
- The **backend** is the only holder of `GEMINI_API_KEY`,
  `ENCRYPTION_MASTER_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- For authenticated routes the backend creates a Supabase client *with the
  caller's own JWT* (`supabaseForUser`), so **RLS still applies server-side**.
  The service-role client exists only inside the share routes, where the
  anonymous viewer has no JWT and authorization is done explicitly by token.

## 2. Frontend structure

```
src/
  main.jsx                 entry: Router + AuthProvider
  App.jsx                  route table (public: /login /signup /share/:token;
                           private: / /files /bundles /reminders /shares)
  context/AuthContext.jsx  session state via supabase.auth.onAuthStateChange
  components/
    ProtectedRoute.jsx     redirects to /login when no session
    Layout.jsx             sidebar shell for all private pages
    ShareModal.jsx         create-share dialog (expiry picker, copy URL)
    ReminderForm.jsx       ONE form for manual entry AND AI review
                           (+ RxTerms autocomplete via <datalist>)
    ui.jsx                 Button/Card/Field/Alert/Badge primitives
  services/                the only place network calls live
    api.js                 API_URL + authHeader() + parseJson()
    files.js               upload (→backend), list (→Supabase), preview (→backend),
                           delete, assign-to-bundle
    bundles.js             bundle CRUD (→Supabase)
    shares.js              create/list/revoke links (→Supabase),
                           public share fetch (→backend)
    reminders.js           reminder CRUD (→Supabase)
    ai.js                  extraction calls (→backend)
  pages/                   one component per screen
```

Convention: pages never call `fetch`/`supabase` directly — always through a
service module.

## 3. Backend structure

```
src/
  server.js          CORS (origin allow-list from FRONTEND_ORIGIN),
                     /health, mounts /api/share BEFORE the JWT wall,
                     JWT middleware for all other /api/*, error handler
  routes/
    files.js         POST /api/files            encrypted upload
                     GET  /api/files/:id/view   decrypt + stream to owner
    share.js         GET  /api/share/:token             share manifest (public)
                     GET  /api/share/:token/files/:id   decrypt + stream (public)
    ai.js            POST /api/ai/extract-medications   Gemini extraction
  lib/
    crypto.js        AES-256-GCM envelope encryption (see §6)
    gemini.js        prompt + JSON response schema + output sanitizer
    supabase.js      supabaseForUser(jwt) / supabaseAdmin / getUserFromToken
```

## 4. Database schema (PostgreSQL via Supabase)

Defined in [`backend/supabase/schema.sql`](../backend/supabase/schema.sql).
RLS is enabled on **every** table; all policies reduce to
`user_id = auth.uid()` (directly or via a parent-row `EXISTS` check).

```
auth.users (managed by Supabase Auth)
   │ 1:1  (trigger handle_new_user creates the profile row on signup)
   ▼
profiles            id PK→auth.users, full_name, date_of_birth, timestamps

file_bundles        id PK, user_id→auth.users, name, description, event_date
   │ 1:N (bundle_id is nullable; deleting a bundle sets it NULL)
   ▼
medical_files       id PK, user_id, bundle_id→file_bundles,
                    file_name, file_type (real MIME), storage_path UNIQUE
                    ('<user_id>/<uuid>-<name>.enc'), size_bytes,
                    category ∈ {prescription, lab_report, imaging,
                                discharge_summary, other}, uploaded_at

shared_links        id PK, user_id, token UNIQUE (48-hex,
                    default encode(gen_random_bytes(24),'hex')),
                    label, expires_at (CHECK: future, ≤30 days), revoked, created_at

shared_link_files   (link_id→shared_links, file_id→medical_files) PK
                    -- junction only; NO URLs or credentials stored

reminders           id PK, user_id, medication_name, dosage, frequency,
                    times_of_day time[], start/end dates, notes,
                    source ∈ {manual, ai}, source_file_id→medical_files,
                    is_active, created_at

health_readings     id PK, user_id, reading_type ∈ {blood_sugar,
                    blood_pressure, weight, heart_rate, temperature,
                    oxygen_saturation}, value_primary, value_secondary
                    (diastolic for BP), unit, context, notes, measured_at
```

**Storage:** one private bucket `medical-files`. Objects are always ciphertext
(`application/octet-stream` is the only MIME type the bucket accepts). Object
keys are `<user_id>/…`, and four `storage.objects` policies compare the first
path segment to `auth.uid()`.

## 5. Key data flows

### Encrypted upload
```
browser ── multipart POST /api/files (user JWT) ──▶ backend
  backend: validate JWT → validate MIME/size → AES-256 seal (crypto.js)
           → storage upload  (as the user  ⇒ RLS applies)
           → metadata insert (as the user  ⇒ RLS applies)
           → on insert failure: remove the uploaded object (no orphans)
  ◀── metadata row (JSON)
```

### Owner preview
```
browser ── GET /api/files/:id/view (user JWT) ──▶ backend
  backend: fetch row + ciphertext as the user → decrypt → stream
           (Content-Type from DB row; Cache-Control: no-store)
browser: response → Blob → URL.createObjectURL → new tab
```

### Share creation (frontend-only, RLS-protected)
```
insert shared_links row      (DB generates the 48-hex token)
insert shared_link_files rows (junction only)
   └─ on failure: delete the link row (rollback, no dangling token)
share URL = origin + /share/ + token
```

### Public share view (anonymous doctor)
```
browser ── GET /api/share/:token ──▶ backend
  backend: token format check (48 hex) →
           service-role query: token = ? AND revoked = false AND expires_at > now()
           → null ⇒ {share:null}   (identical for unknown/expired/revoked)
           → else manifest (file list, NO storage paths)
per file: GET /api/share/:token/files/:fileId
  backend: SAME validation again (⇒ instant revocation) → verify the file
           belongs to this link → download ciphertext (service role) →
           decrypt → stream (Referrer-Policy: no-referrer)
```

### AI reminder extraction
```
browser ── POST /api/ai/extract-medications (user JWT) ──▶ backend
  input: multipart file  OR  { storage_path } (must start with "<caller uid>/";
         downloaded as the user ⇒ RLS also enforces; decrypted before use)
  backend → Gemini (model from GEMINI_MODEL, default gemini-3-flash-preview;
                    temperature 0, responseSchema-constrained JSON,
                    "never invent" prompt)
  sanitizer: drop nameless entries, strip strength/form from names,
             enforce HH:MM times, cap lengths
  ◀── { medications: [...] }
frontend: one editable draft card per medication →
          user reviews/edits → "Create reminder" → insert into reminders
          (source='ai', source_file_id) — nothing saved before confirmation
```

## 6. Encryption format (crypto.js)

Envelope scheme — every file gets its own random data key (DEK), which is
itself encrypted ("wrapped") by the master key from `.env`:

```
[ "EVD1" 4B | wrapIv 12B | wrapTag 16B | wrappedDEK 32B | iv 12B | tag 16B | ciphertext ]
```

- Cipher: AES-256-GCM at both layers (confidentiality + tamper detection —
  a single flipped byte makes decryption fail loudly).
- Blobs are self-contained: no key material in the database.
- `decryptBuffer` passes non-`EVD1` data through unchanged (legacy plaintext
  files keep working).
- Rotating `ENCRYPTION_MASTER_KEY` requires re-encrypting existing objects;
  losing it makes them permanently unreadable.

## 7. Backend API reference

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /health` | none | liveness check |
| `POST /api/files` | user JWT | encrypted upload (multipart: `file`, `category`, optional `for_user`). Validates PDF (#3) + enforces storage quota (#4) before storing |
| `GET /api/files/usage` | user JWT | storage footprint: `{ usedBytes, quotaBytes, availableBytes, percentUsed }` (#4) |
| `GET /api/files/:id/view` | user JWT | decrypt + stream own file |
| `POST /api/ai/extract-medications` | user JWT | Gemini extraction (multipart `file` or JSON `{storage_path}`) |
| `GET /api/share/:token` | none | share manifest, `{share:null}` if invalid |
| `GET /api/share/:token/files/:fileId` | none | decrypt + stream one shared file |
| `POST /api/family/invite` | user JWT | email a one-time code to the recipient; create a hidden `code_pending` connection; uniform response (no enumeration) (#2) |
| `POST /api/family/confirm-code` | user JWT | **sender** submits the code the recipient gave them → invitation revealed to recipient; single-use, lockout on repeated failures (#2) |
| `POST /api/family/resend-code` | user JWT | sender requests a fresh code be emailed to the recipient (cooldown + per-connection cap) (#2) |
| `GET /api/push/public-key` | user JWT | VAPID public key for browser push subscription (#1) |
| `POST /api/push/subscribe` / `unsubscribe` | user JWT | register/remove this browser's push subscription (#1) |
| `POST /api/push/test` | user JWT | send yourself a test notification (#1) |

**AI extraction pipeline (#8):** for PDFs, the backend first tries text
extraction → cleaned Markdown (headings/lists/tables preserved; repeated
headers, footers and page numbers stripped) and sends Gemini *text* instead of
billed page images (~80%+ token reduction on typed documents). Results are
cached per file in `ai_markdown_cache`. Scanned/handwritten PDFs (no text
layer) automatically fall back to the vision pipeline. The response includes
`pipeline: "markdown" | "markdown-cached" | "vision"`, and per-conversion
metrics (sizes, token estimates, reduction %, processing time) are logged.

**Reminder scheduler (#1):** the backend checks every 20s (idempotent per
minute) for active reminders whose `times_of_day` matches the current minute
in `REMINDER_TIMEZONE`, and Web-Pushes each owner's registered devices. Dead
subscriptions are pruned automatically. The frontend is a PWA (installable;
app shell precached for offline; API/PHI responses are never cached).

All error responses are `{ "error": "<message>" }`. `401` = missing/invalid
JWT; share routes return identical 404s for unknown/expired/revoked tokens.

**Upload validation status codes (#3, #4):** `413` file/quota too large · `415`
not a valid PDF · `422` encrypted, corrupted, or over the page limit. Every
limit is env-configurable via `backend/src/lib/config.js`.

## 8. Environment variables

| Variable | File | Secret? | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | frontend/.env | no (publishable) | Supabase client |
| `VITE_API_URL` | frontend/.env | no | backend base URL |
| `PORT`, `FRONTEND_ORIGIN` | backend/.env | no | server port; comma-separated CORS allow-list |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | backend/.env | no | user-scoped Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | backend/.env | **yes** | share streaming only |
| `GEMINI_API_KEY` | backend/.env | **yes** | AI extraction |
| `ENCRYPTION_MASTER_KEY` | backend/.env | **yes — irreplaceable** | AES-256 envelope master key |
| `MAX_PDF_SIZE_MB` (15), `MAX_PDF_PAGES` (6), `MAX_IMAGE_SIZE_MB` (20) | backend/.env | no | upload limits (#3) |
| `USER_STORAGE_QUOTA_MB` (100) | backend/.env | no | per-user storage quota (#4) |
| `OTP_LENGTH` (6), `OTP_TTL_MINUTES` (10), `OTP_MAX_ATTEMPTS` (5), `OTP_RESEND_COOLDOWN_SECONDS` (60), `OTP_MAX_PER_HOUR` (5) | backend/.env | no | account-linking OTP (#2) |
| `OTP_SECRET` | backend/.env | **yes (optional)** | HMAC secret for OTP hashing; defaults to the master key |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | backend/.env | private key **yes** | Web Push identity (#1) |
| `REMINDER_TIMEZONE` (Asia/Kolkata) | backend/.env | no | timezone reminders fire in (#1) |
| `MARKDOWN_MIN_CHARS` (200) | backend/.env | no | text threshold below which PDFs fall back to vision (#8) |
