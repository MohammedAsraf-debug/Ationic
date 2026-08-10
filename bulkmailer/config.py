import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-this")

    # MySQL
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
    MYSQL_DB = os.environ.get("MYSQL_DB", "bulkmailer")

    # Encryption key for storing user SMTP app-passwords (Fernet key, 32 url-safe base64 bytes)
    FERNET_KEY = os.environ.get("FERNET_KEY")  # generate with generate_key.py

    # Shared sending service (your own SMTP relay, e.g. Brevo free tier)
    SHARED_SMTP_HOST = os.environ.get("SHARED_SMTP_HOST", "smtp-relay.brevo.com")
    SHARED_SMTP_PORT = int(os.environ.get("SHARED_SMTP_PORT", 587))
    SHARED_SMTP_EMAIL = os.environ.get("SHARED_SMTP_EMAIL", "")
    SHARED_SMTP_PASSWORD = os.environ.get("SHARED_SMTP_PASSWORD", "")

    # Abuse prevention
    DAILY_EMAIL_LIMIT_PER_USER = int(os.environ.get("DAILY_EMAIL_LIMIT_PER_USER", 200))
    SEND_DELAY_SECONDS = float(os.environ.get("SEND_DELAY_SECONDS", 3.0))
    MAX_RECIPIENTS_PER_CAMPAIGN = int(os.environ.get("MAX_RECIPIENTS_PER_CAMPAIGN", 500))

    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max CSV upload
