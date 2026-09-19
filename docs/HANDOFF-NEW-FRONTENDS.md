# Handoff — Combined EvoCare + EvoDoc Frontend

**Date:** 2026-07-12 (final restructure — single combined frontend, portal landing)
**Goal:** One frontend folder serving a portal landing (`/`) with two buttons —
**EvoCare** (`/evocare`, the full patient app — unchanged working paths) and
**EvoDoc** (`/evodoc`, clinician marketing + the one functional piece: the
pre-registration form). Backend (`api.evodev.site` / Mumbai Supabase
`vuglxwkqifykdpcijcco`) required **zero changes**.

---

## Final structure

| Path | What | Status |
|---|---|---|
| `frontend/` | **The** app now — single Next.js project, standalone (no more Vite-embedding, no basePath) | ✅ built & verified |
| `frontend-legacy/` | The OLD Vite React app — renamed, not deleted. Nothing depends on it anymore. Safe to delete once you're satisfied. | kept as backup |
| `evocare-frontend/` | Original source the app was copied from (Vite landing + `src/demo` Next app) | untouched, safe to delete once satisfied |
| `evodoc-frontend/` | Original source the marketing/registration content was ported from | untouched, safe to delete once satisfied |

**Inside `frontend/`:**
- `/` — new portal landing, two cards linking to `/evocare` and `/evodoc`
- `/evocare` — new small entry page (Get started / Sign in) → unchanged `/login`, `/signup`, `/dashboard/*`, `/onboarding/*` (every existing EvoCare route kept its original path — nothing was moved/renamed, so no internal links broke)
- `/evodoc` — new page: marketing copy + the **working** registration form → `POST /api/signup` → `signups` table (service-role key, server-only route)
- `/privacy` — new lightweight page (the terms checkbox links here)
- `/share/[token]` — new: the public doctor-facing share viewer, ported from the old app, now living on this app instead
- `lib/basePath.js` — now a no-op (`BASE_PATH = ""`); kept only so the many existing `withBasePath(...)` call sites across the codebase didn't need to change
- `next.config.mjs` — dropped the `/demo-dashboard` basePath + static-export machinery; this is a normal standalone Next.js app now

---

## ✅ Verified working (this session, live)

- `next build` passes — all 24 routes compile (`/`, `/evocare`, `/evodoc`, `/privacy`, `/share/[token]`, `/api/signup`, plus every pre-existing EvoCare route).
- Portal landing renders correctly, both cards link to the right routes (confirmed via accessibility snapshot + click-through).
- `/evocare` and `/evodoc` render correctly (confirmed via snapshot — full registration form with all fields present on `/evodoc`).
- **Real signup tested end-to-end**: submitted the `/signup` form with a live Supabase call (not a stub) → account created successfully → correctly redirected to `/onboarding/phone` (proves the basePath removal, the auth wiring, and the phone-gate redirect logic all work correctly in the restructured app).
- CORS: added `http://localhost:3000` to the local backend's `FRONTEND_ORIGIN` (already present in the file; no server change needed).

## ⚠️ One environment quirk found (not a code bug — do not "fix" this by changing app code)

While testing via the in-session preview/browser-automation tool, the **backend process it spawned** hit `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (a TLS certificate-trust error) on outbound HTTPS calls to Supabase — this blocked the phone-claim call from completing during that specific test. Isolated and confirmed via three independent checks:
1. A backend process started directly via a normal shell reached Supabase with **zero** TLS errors.
2. A frontend process started directly via a normal shell correctly bundled the real Supabase key (client-side signup call worked with a plain shell-started process, but showed a stale cached key when relaunched through the preview tool's own launcher).
3. The error trace pointed at Node's TLS layer specifically inside the preview tool's spawned process, not inside any of the app's own code paths.

**Conclusion:** this is specific to how the in-session preview/browser tool spawns child processes on this machine — it does not affect you running the app normally (`npm run dev` in your own terminal, exactly as you've done successfully all session for auth/SMS/email testing). No action needed unless you personally hit this same error when using that in-editor preview tool again.

## ⏳ Remaining (credentials/DB — deliberately left for you)

1. **Run the `signups` migration** in the Mumbai SQL Editor: `evodoc-frontend/supabase/migrations/20260710024339_create_signups.sql`. Until this runs, the `/evodoc` registration form's UI works but the DB insert will fail — **this is the one thing not yet verified end-to-end**, purely because it needs a migration only you can run.
2. **`frontend/.env.local`** already has real values filled in (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — same Mumbai project the backend uses). Nothing to paste — already done for you this session.
3. **Test the `/evodoc` form** once the migration is run: `cd frontend && npm run dev` → `http://localhost:3000/evodoc` → submit → confirm a row appears in `signups`.
4. **Deployment:** point your production domain at this single `frontend/` app (Vercel or the EC2 Nginx setup, your call). Then update: Supabase Auth Site URL/Redirect URLs, backend `FRONTEND_ORIGIN` + `APP_URL`, and `frontend/.env.local`'s `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SHARE_BASE_URL` for the real production origin. Retire `frontend-legacy/`'s old Vercel deployment once this is live — nothing depends on it.
5. **Cleanup (optional, whenever ready):** `frontend-legacy/`, `evocare-frontend/`, `evodoc-frontend/` can all be deleted — their working content now lives in `frontend/`. Kept for now since none of them were in git history (they were untracked all session) and deleting is one-way.

## Key context
- Backend reference: `docs/FLOWS.md`, `docs/SERVICES.md`, `docs/PHONE-OTP-AND-SES.md`.
- Pre-launch phone = claim only (no SMS — AWS Free plan blocks SNS); SES email live (sandbox until production access approval).
- EC2 Mumbai + Elastic IP; pm2 auto-start verified; server `.env` already points at Mumbai Supabase.
- `.claude/launch.json` (repo root) now has both `evo-web` (port 3000, `frontend/`) and `evo-backend` (port 4000, `backend/`) launch configs for local dev via the preview tool.
