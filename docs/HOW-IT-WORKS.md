# How EvoDoc Works — In Plain English

*This guide assumes no technical background. Every technical term is explained
with an everyday comparison.*

---

## The cast of characters

EvoDoc is made of three cooperating parts:

| Part | Everyday comparison | What it does |
|------|---------------------|--------------|
| (frontend) | The reception area | What you see in your browser: pages, buttons, forms |
| (backend)  | A staff-only room | Holds all the secret keys, seals and unseals files, talks to the AI |
| (Supabase) | A bank with safe-deposit boxes | Stores accounts, records and files, and enforces who may open what |

The website never holds any secrets. Anything sensitive — encryption keys, the
AI key, the master vault key — lives only in the back office, on the server.

---

## Signing up and logging in

When you create an account, the vault's front desk (Supabase Auth) takes your
email and password. Your password is scrambled in a one-way fashion before
storage — nobody, not even the developers, can read it back.

After logging in, your browser carries an **ID badge** (a digitally signed
session pass). Every time you open a page or ask for a file, the badge is
checked first. No badge, no entry — you're sent back to the login page.

## Storing a document

1. You choose a file (a prescription photo, a lab report PDF).
2. It travels to the back office, which **seals it inside an AES-256 encrypted
   envelope** — the same encryption standard banks and governments use. From
   this moment the file is unreadable scrambled data.
3. The sealed envelope goes into your personal drawer in the vault. Every
   drawer is labeled with its owner's identity, and the vault's rules say:
   *only the matching ID badge opens this drawer.*
4. A card describing the file (name, type, date) goes into your personal
   card catalog, protected by the same ownership rules.

When you click "View", the reverse happens: the back office checks your badge,
fetches your sealed envelope, unseals it, and hands the readable file to your
browser — where it exists only temporarily.

**Why the envelope matters:** even if someone somehow broke into the vault
itself, they would find only scrambled noise. The unsealing key never leaves
the back office.

## Health events (bundles)

A health event is a labeled folder — "Cardiology Visit – June 2026" — that you
drop related documents into. Deleting a folder never deletes the documents
inside; they just lose the label.

## Sharing with a doctor

When you press **Share** and pick how long the link should live:

1. The vault generates an **unguessable 48-character code** — there are more
   possible codes than grains of sand on Earth, many times over.
2. The code is stored with your chosen expiry time and the exact list of
   documents it unlocks — nothing more.
3. Your link is simply: `your-app.com/share/<the-code>`.

When the doctor clicks it, the back office asks three questions **every single
time**: Is this a real code? Has it expired? Has the owner cancelled it? Only
if all three pass does it unseal the documents and show them. The doctor needs
no account — the code is the key, and it self-destructs on schedule.

If any check fails — wrong code, expired, cancelled — the doctor sees the exact
same polite "this link is not available" page. It never says *why*, so nobody
can fish for clues.

**Cancelling is instant.** Because the three questions are asked on every
view, flipping the "revoked" switch cuts off access immediately, even mid-visit.

## Medication reminders

There is **one form** for reminders — name, dosage, frequency, times — and two
ways to fill it:

**By hand:** type it in. As you type the medicine name, live suggestions appear
from the U.S. National Library of Medicine's public drug directory (type
"metfo" → *metformin, metformin XR, …*).

**By AI:** pick a prescription (or scan a new one). The back office checks your
ID badge, confirms the file is yours, unseals it, and sends it to Google's
Gemini AI with strict instructions — most importantly: *"extract only what is
written; never invent."* The AI must answer on a fixed form (name, dosage,
frequency, times), a quality inspector throws out anything malformed, and the
answers come back as **pre-filled draft cards**.

Here is the safety net: **nothing is saved until you review each card and press
"Create reminder."** You can correct any box or throw a card away. Reminders
created this way carry a small "AI" tag so you always know which ones the AI
helped with.

## What keeps everything private — the short version

- **Your password**: scrambled irreversibly; nobody can read it.
- **Your files**: AES-256 sealed before storage; the key lives only in the
  back office.
- **Your records**: the vault enforces "owner's badge only" on every single
  table — this is checked *by the vault itself*, not by the app's good manners.
- **Share links**: unguessable, self-expiring, instantly cancellable, and
  silent about why a dead link is dead.
- **The AI key and vault master keys**: locked in the back office settings
  file, never sent to any browser, never saved in the code.

For the full technical treatment, see [SECURITY.md](SECURITY.md).
