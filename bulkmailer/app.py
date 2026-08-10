import csv
import io
import os
from functools import wraps

from flask import (
    Flask, render_template, request, redirect, url_for,
    session, flash, jsonify
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from config import Config
from db import run_query
from crypto_utils import encrypt
from mailer import start_campaign_async, cancel_campaign, check_daily_limit

app = Flask(__name__)
app.config.from_object(Config)

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)


# ---------- Auth helpers ----------

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return wrapper


# ---------- Auth routes ----------

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not name or not email or not password:
            flash("All fields are required.")
            return redirect(url_for("register"))

        existing = run_query("SELECT id FROM users WHERE email=%s", (email,), fetch="one")
        if existing:
            flash("An account with this email already exists.")
            return redirect(url_for("login"))

        password_hash = generate_password_hash(password)
        user_id = run_query(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
            (name, email, password_hash),
        )
        session["user_id"] = user_id
        session["user_name"] = name
        return redirect(url_for("dashboard"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        user = run_query("SELECT * FROM users WHERE email=%s", (email,), fetch="one")
        if not user or not check_password_hash(user["password_hash"], password):
            flash("Invalid email or password.")
            return redirect(url_for("login"))

        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        return redirect(url_for("dashboard"))

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ---------- Dashboard ----------

@app.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
    campaigns = run_query(
        "SELECT * FROM campaigns WHERE user_id=%s ORDER BY created_at DESC",
        (session["user_id"],),
        fetch="all",
    )
    _, remaining = check_daily_limit(session["user_id"], 0)
    smtp_account = run_query(
        "SELECT smtp_email FROM smtp_accounts WHERE user_id=%s ORDER BY id DESC LIMIT 1",
        (session["user_id"],),
        fetch="one",
    )
    return render_template(
        "dashboard.html",
        campaigns=campaigns,
        remaining=remaining,
        daily_limit=Config.DAILY_EMAIL_LIMIT_PER_USER,
        smtp_account=smtp_account,
    )


# ---------- SMTP account connection ----------

@app.route("/connect-smtp", methods=["GET", "POST"])
@login_required
def connect_smtp():
    if request.method == "POST":
        smtp_email = request.form.get("smtp_email", "").strip()
        smtp_password = request.form.get("smtp_password", "").strip()
        smtp_host = request.form.get("smtp_host", "smtp.gmail.com").strip()
        smtp_port = int(request.form.get("smtp_port", 587))

        if not smtp_email or not smtp_password:
            flash("Email and app password are required.")
            return redirect(url_for("connect_smtp"))

        encrypted_password = encrypt(smtp_password)
        run_query(
            """INSERT INTO smtp_accounts (user_id, smtp_host, smtp_port, smtp_email, smtp_password_encrypted)
               VALUES (%s, %s, %s, %s, %s)""",
            (session["user_id"], smtp_host, smtp_port, smtp_email, encrypted_password),
        )
        flash("SMTP account connected successfully.")
        return redirect(url_for("dashboard"))

    return render_template("connect_smtp.html")


# ---------- Campaign creation ----------

@app.route("/campaigns/new", methods=["GET", "POST"])
@login_required
def new_campaign():
    if request.method == "POST":
        subject = request.form.get("subject", "").strip()
        message = request.form.get("message", "").strip()
        send_method = request.form.get("send_method")

        if not subject or not message or send_method not in ("own_smtp", "shared_service"):
            flash("Subject, message, and send method are required.")
            return redirect(url_for("new_campaign"))

        if send_method == "own_smtp":
            account = run_query(
                "SELECT id FROM smtp_accounts WHERE user_id=%s LIMIT 1",
                (session["user_id"],),
                fetch="one",
            )
            if not account:
                flash("Connect your SMTP account first.")
                return redirect(url_for("connect_smtp"))

        # Parse recipients from CSV upload or textarea paste
        recipients = []
        file = request.files.get("csv_file")
        if file and file.filename:
            filename = secure_filename(file.filename)
            stream = io.StringIO(file.stream.read().decode("utf-8-sig"), newline=None)
            reader = csv.DictReader(stream)
            for row in reader:
                email = (row.get("email") or row.get("Email") or "").strip()
                name = (row.get("name") or row.get("Name") or "").strip()
                if email:
                    recipients.append((email, name))
        else:
            pasted = request.form.get("pasted_emails", "").strip()
            for line in pasted.splitlines():
                line = line.strip()
                if not line:
                    continue
                parts = [p.strip() for p in line.split(",")]
                email = parts[0]
                name = parts[1] if len(parts) > 1 else ""
                if email:
                    recipients.append((email, name))

        if not recipients:
            flash("No valid recipients found. Upload a CSV or paste emails.")
            return redirect(url_for("new_campaign"))

        if len(recipients) > Config.MAX_RECIPIENTS_PER_CAMPAIGN:
            flash(f"Max {Config.MAX_RECIPIENTS_PER_CAMPAIGN} recipients per campaign. Split into multiple campaigns.")
            return redirect(url_for("new_campaign"))

        allowed, remaining = check_daily_limit(session["user_id"], len(recipients))
        if not allowed:
            flash(f"This campaign needs {len(recipients)} sends but you only have {remaining} left today.")
            return redirect(url_for("new_campaign"))

        campaign_id = run_query(
            """INSERT INTO campaigns (user_id, subject, message, send_method, total_recipients)
               VALUES (%s, %s, %s, %s, %s)""",
            (session["user_id"], subject, message, send_method, len(recipients)),
        )

        for email, name in recipients:
            run_query(
                "INSERT INTO recipients (campaign_id, email, name) VALUES (%s, %s, %s)",
                (campaign_id, email, name),
            )

        start_campaign_async(campaign_id, session["user_id"])

        flash("Campaign started! Track progress below.")
        return redirect(url_for("campaign_detail", campaign_id=campaign_id))

    smtp_account = run_query(
        "SELECT smtp_email FROM smtp_accounts WHERE user_id=%s ORDER BY id DESC LIMIT 1",
        (session["user_id"],),
        fetch="one",
    )
    return render_template("new_campaign.html", smtp_account=smtp_account)


@app.route("/campaigns/<int:campaign_id>")
@login_required
def campaign_detail(campaign_id):
    campaign = run_query(
        "SELECT * FROM campaigns WHERE id=%s AND user_id=%s",
        (campaign_id, session["user_id"]),
        fetch="one",
    )
    if not campaign:
        flash("Campaign not found.")
        return redirect(url_for("dashboard"))

    recipients = run_query(
        "SELECT * FROM recipients WHERE campaign_id=%s ORDER BY id",
        (campaign_id,),
        fetch="all",
    )
    return render_template("campaign_detail.html", campaign=campaign, recipients=recipients)


@app.route("/campaigns/<int:campaign_id>/status")
@login_required
def campaign_status(campaign_id):
    """JSON polling endpoint for live progress bar."""
    campaign = run_query(
        "SELECT status, sent_count, failed_count, total_recipients FROM campaigns WHERE id=%s AND user_id=%s",
        (campaign_id, session["user_id"]),
        fetch="one",
    )
    if not campaign:
        return jsonify({"error": "not found"}), 404
    return jsonify(campaign)


@app.route("/campaigns/<int:campaign_id>/cancel", methods=["POST"])
@login_required
def cancel_campaign_route(campaign_id):
    campaign = run_query(
        "SELECT id FROM campaigns WHERE id=%s AND user_id=%s",
        (campaign_id, session["user_id"]),
        fetch="one",
    )
    if not campaign:
        return jsonify({"error": "not found"}), 404
    cancelled = cancel_campaign(campaign_id)
    return jsonify({"cancelled": cancelled})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
