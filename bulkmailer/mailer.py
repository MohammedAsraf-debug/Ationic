import smtplib
import time
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date

from config import Config
from db import run_query
from crypto_utils import decrypt

# Track running campaigns so we can query/cancel status if needed
_running_campaigns = {}


def personalize(text: str, name: str) -> str:
    return text.replace("{name}", name or "there")


def send_one_email(smtp_conn, from_email, to_email, subject, body_html):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.attach(MIMEText(body_html, "html"))
    smtp_conn.sendmail(from_email, to_email, msg.as_string())


def get_smtp_connection(campaign, user_id):
    """Opens an SMTP connection based on the campaign's chosen send method."""
    if campaign["send_method"] == "own_smtp":
        account = run_query(
            "SELECT * FROM smtp_accounts WHERE user_id=%s ORDER BY id DESC LIMIT 1",
            (user_id,),
            fetch="one",
        )
        if not account:
            raise ValueError("No SMTP account connected for this user.")
        host = account["smtp_host"]
        port = account["smtp_port"]
        email_addr = account["smtp_email"]
        password = decrypt(account["smtp_password_encrypted"])
    else:
        host = Config.SHARED_SMTP_HOST
        port = Config.SHARED_SMTP_PORT
        email_addr = Config.SHARED_SMTP_EMAIL
        password = Config.SHARED_SMTP_PASSWORD

    conn = smtplib.SMTP(host, port, timeout=30)
    conn.starttls()
    conn.login(email_addr, password)
    return conn, email_addr


def check_daily_limit(user_id, additional_count):
    """Returns (allowed: bool, remaining: int)"""
    today = date.today()
    row = run_query(
        "SELECT emails_sent FROM usage_limits WHERE user_id=%s AND date=%s",
        (user_id, today),
        fetch="one",
    )
    sent_today = row["emails_sent"] if row else 0
    remaining = Config.DAILY_EMAIL_LIMIT_PER_USER - sent_today
    return remaining >= additional_count, remaining


def increment_usage(user_id, count):
    today = date.today()
    run_query(
        """INSERT INTO usage_limits (user_id, date, emails_sent) VALUES (%s, %s, %s)
           ON DUPLICATE KEY UPDATE emails_sent = emails_sent + %s""",
        (user_id, today, count, count),
    )


def run_campaign(campaign_id, user_id):
    """
    Runs in a background thread. Sends each recipient with a delay,
    updates DB row-by-row so the frontend can poll progress.
    """
    _running_campaigns[campaign_id] = {"cancel": False}

    try:
        campaign = run_query(
            "SELECT * FROM campaigns WHERE id=%s", (campaign_id,), fetch="one"
        )
        recipients = run_query(
            "SELECT * FROM recipients WHERE campaign_id=%s AND status='pending'",
            (campaign_id,),
            fetch="all",
        )

        run_query(
            "UPDATE campaigns SET status='running', started_at=NOW() WHERE id=%s",
            (campaign_id,),
        )

        smtp_conn, from_email = get_smtp_connection(campaign, user_id)

        sent = 0
        failed = 0

        for r in recipients:
            if _running_campaigns[campaign_id]["cancel"]:
                run_query(
                    "UPDATE campaigns SET status='cancelled' WHERE id=%s",
                    (campaign_id,),
                )
                break

            # Re-check daily limit before every send (in case other campaigns are running too)
            allowed, _ = check_daily_limit(user_id, 1)
            if not allowed:
                run_query(
                    "UPDATE recipients SET status='failed', error_message=%s WHERE id=%s",
                    ("Daily send limit reached", r["id"]),
                )
                failed += 1
                continue

            try:
                subject = personalize(campaign["subject"], r["name"])
                body = personalize(campaign["message"], r["name"])
                send_one_email(smtp_conn, from_email, r["email"], subject, body)

                run_query(
                    "UPDATE recipients SET status='sent', sent_at=NOW() WHERE id=%s",
                    (r["id"],),
                )
                increment_usage(user_id, 1)
                sent += 1

            except Exception as e:
                run_query(
                    "UPDATE recipients SET status='failed', error_message=%s WHERE id=%s",
                    (str(e)[:500], r["id"]),
                )
                failed += 1

            run_query(
                "UPDATE campaigns SET sent_count=%s, failed_count=%s WHERE id=%s",
                (sent, failed, campaign_id),
            )

            time.sleep(Config.SEND_DELAY_SECONDS)

        smtp_conn.quit()

        final_status = "completed" if not _running_campaigns[campaign_id]["cancel"] else "cancelled"
        run_query(
            "UPDATE campaigns SET status=%s, completed_at=NOW() WHERE id=%s",
            (final_status, campaign_id),
        )

    except Exception as e:
        run_query(
            "UPDATE campaigns SET status='failed' WHERE id=%s",
            (campaign_id,),
        )
        print(f"Campaign {campaign_id} failed: {e}")

    finally:
        _running_campaigns.pop(campaign_id, None)


def start_campaign_async(campaign_id, user_id):
    thread = threading.Thread(target=run_campaign, args=(campaign_id, user_id), daemon=True)
    thread.start()


def cancel_campaign(campaign_id):
    if campaign_id in _running_campaigns:
        _running_campaigns[campaign_id]["cancel"] = True
        return True
    return False
