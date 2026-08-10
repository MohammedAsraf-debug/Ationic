# Ationic Bulk Mailer

A self-hosted bulk email tool. Users register, connect their own Gmail (via app password)
or use your shared SMTP relay, then create campaigns with subject/message + a recipient list.
Sending runs in a background thread with a delay between emails, live progress bar, and a
per-recipient sent/failed log.

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Set up MySQL
```bash
mysql -u root -p < schema.sql
```

### 3. Generate your encryption key
```bash
python generate_key.py
```
Copy the printed `FERNET_KEY=...` line.

### 4. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `MYSQL_PASSWORD` — your MySQL root password
- `FERNET_KEY` — from step 3
- `SHARED_SMTP_*` — only needed if you want the "shared service" option to work.
  Brevo (formerly Sendinblue) has a free tier: 300 emails/day. Sign up at brevo.com →
  Settings → SMTP & API → get your SMTP login + key.

### 5. Run it
```bash
python app.py
```
Visit `http://localhost:5000`

## How it works

- **Register/Login** — plain email+password auth (password hashed with Werkzeug)
- **Connect SMTP** — user enters their Gmail + App Password (NOT their real password).
  This gets encrypted with Fernet before hitting the database.
- **New Campaign** — subject + message (supports `{name}` placeholder), pick send method,
  upload a CSV (`email,name` columns) or paste a list.
- **Sending** — runs in a background thread (`mailer.py`), not the request thread, so it
  won't time out on large lists. Sends one-by-one with a configurable delay
  (`SEND_DELAY_SECONDS`, default 3s) to avoid spam flags.
- **Progress** — the campaign detail page polls `/campaigns/<id>/status` every 2 seconds
  for live sent/failed counts.
- **Rate limiting** — each user has a daily send cap (`DAILY_EMAIL_LIMIT_PER_USER`, default
  200/day) tracked in the `usage_limits` table. This applies regardless of which SMTP method
  they use — it's about preventing abuse of your platform, not just protecting your own quota.

## Important limits to know

- **Gmail's own cap**: 500/day per Gmail account, and Google will flag/suspend accounts that
  send too fast or get marked as spam. This is Google's limit, your app can't bypass it.
- **Shared service cap**: Free-tier SMTP relays (Brevo, etc.) are usually 100-300/day *total*,
  shared across every user on your platform combined. This will run out fast with real usage —
  it's fine for testing/demo, not for scaled usage. You'll eventually want a paid relay tier
  (SendGrid/Mailgun/Brevo paid plans) once you have real users.
- **This is single-server threading**, not a proper job queue (Celery+Redis). Fine for
  moderate concurrent campaigns. If you get many users running large campaigns simultaneously,
  threads will pile up — that's the point where you'd migrate to Celery.
- **No unsubscribe link / bounce handling** — for actual client-facing campaigns (not just
  internal outreach) you'll eventually want these for deliverability and legal compliance
  (CAN-SPAM / India's IT Act don't strictly require it for B2B outreach, but ISPs will spam-flag
  you without one).

## What's NOT built yet (intentional v1 scope)

- Email templates library
- Open/click tracking
- Scheduled sends (send later)
- Unsubscribe management
- Paid plans / credit system
- Google OAuth login

## File structure
```
bulkmailer/
├── app.py              # Flask routes
├── mailer.py           # Background sending engine
├── db.py               # MySQL connection helper
├── crypto_utils.py     # Encrypts stored SMTP passwords
├── config.py           # Settings from .env
├── generate_key.py     # One-time: makes your FERNET_KEY
├── schema.sql           # MySQL tables
├── requirements.txt
├── .env.example
├── templates/          # Jinja2 HTML
└── static/css/style.css
```
