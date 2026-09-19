# Google OAuth Setup Guide

## Overview
EvoDoc now supports sign-up and sign-in via Google using Supabase's native OAuth provider. Users can create accounts or log in with a single click.

## How It Works

### Email OTP (Current Implementation)
**Sending:** Uses **Resend API** for email delivery
- Generates 6-digit codes via cryptographic randomization
- **Hashes codes with HMAC-SHA256** before storing in database (database leak alone cannot reveal plaintext codes)
- Verification uses **constant-time comparison** to prevent timing attacks
- Silently disables if `RESEND_API_KEY` is missing (app continues working in-app only)

**Flow:**
1. User receives code via email
2. Code is sent to backend and hashed
3. Backend compares HMAC hashes (never touches plaintext)

### Google OAuth (New)
**Flow:**
1. User clicks "Continue with Google" button
2. Redirected to Google's login
3. After approval, Supabase exchanges code for JWT session
4. User is redirected back to the app and automatically logged in
5. Profile is auto-created via database trigger

**Key files modified:**
- `frontend/src/pages/Login.jsx` - Added Google sign-in button
- `frontend/src/pages/Signup.jsx` - Added Google sign-up button
- Both use Supabase's `signInWithOAuth()` with `provider: 'google'`

---

## Setup Steps

### 1. Create Google OAuth Credentials

#### Via Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Add authorized redirect URIs:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   *(Replace `YOUR-PROJECT-REF` with your Supabase project reference)*
7. Copy **Client ID** and **Client Secret**

### 2. Configure in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click **Enable**
5. Paste the **Client ID** and **Client Secret** from step 1
6. Click **Save**

### 3. Add Redirect URL in Frontend (if needed)

The frontend already handles this via `detectSessionInUrl: true` in `supabaseClient.js`. After OAuth callback, Supabase automatically detects and parses the session from the URL.

### 4. Test It

#### Local Development:
```bash
cd frontend
npm install
npm run dev
```

Then:
1. Go to http://localhost:5173/login
2. Click "Continue with Google"
3. Complete Google login
4. Should be redirected back and logged in

#### Production:
Make sure your production URL is added to Google OAuth credentials:
```
https://yourdomain.com/auth/v1/callback
```

---

## How Profiles Are Auto-Created

When a user signs up with Google (or email), Supabase:
1. Creates an `auth.users` record with email and metadata
2. Triggers the `handle_new_user()` function
3. This inserts a row in `public.profiles` with:
   - `id` = user's UUID
   - `email` = from auth.users
   - `full_name` = from `raw_user_meta_data` (if provided, e.g., Google gives "John Doe")

**For Google OAuth specifically:**
- User email is automatically populated
- User name (if provided by Google) is stored in `raw_user_meta_data`
- The trigger extracts it and populates `profiles.full_name`

---

## Code Changes Summary

### Frontend Login Page
```javascript
async function handleGoogleSignIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) setError(error.message)
}
```

### Frontend Signup Page
Same as login — Supabase treats signup and login the same way for OAuth. If the email doesn't exist, it creates a new account.

### No Backend Changes Required
- The backend already validates tokens via `getUserFromToken()`
- OAuth sessions are valid JWT tokens, so they work seamlessly
- Database profiles are auto-created by the existing trigger

---

## Testing Checklist

- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Credentials added to Supabase Authentication → Providers → Google
- [ ] Local app loads without errors
- [ ] "Continue with Google" button appears on Login and Signup pages
- [ ] Click button → redirected to Google login
- [ ] After login → redirected back to app and logged in
- [ ] Profile auto-created in `profiles` table
- [ ] Can access protected pages (Dashboard, Files, etc.)
- [ ] Logout and sign in again — session persists correctly

---

## Troubleshooting

### Error: "Unexpected application state (undefined)"
**Cause:** `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing
**Fix:** Copy `frontend/.env.example` to `frontend/.env` and fill in the values from Supabase

### Error: "Invalid redirect URI"
**Cause:** Redirect URL in Google Console doesn't match Supabase's callback URL
**Fix:** Update Google OAuth credentials to include the correct `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

### User signs in but profile not created
**Cause:** Trigger not firing
**Fix:** Run the schema migration in `backend/supabase/schema.sql` in Supabase SQL Editor (especially the trigger `on_auth_user_created`)

### Blank page after Google redirects back
**Cause:** Session not detected from URL
**Fix:** Check browser console for errors. Ensure `detectSessionInUrl: true` is in `supabaseClient.js`

---

## Security Notes

✅ **OAuth codes are never stored** — Supabase exchanges them for JWTs immediately
✅ **JWTs are signed** — verified on every API request
✅ **Email OTP codes are HMAC-hashed** — database cannot leak plaintext codes
✅ **Constant-time comparison** — prevents timing-based attacks on OTP verification
✅ **RLS policies enforce** — users can only access their own data

---

## Production Deployment Checklist

- [ ] Add production domain to Google OAuth redirect URIs
- [ ] Add production domain to Supabase CORS settings (Authentication → URL Configuration)
- [ ] Add production domain to backend CORS allowlist via `FRONTEND_ORIGIN` env var
- [ ] Test end-to-end in production environment
- [ ] Monitor for any auth errors in server logs
