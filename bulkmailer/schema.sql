-- Bulk Mailer DB Schema (MySQL)

CREATE DATABASE IF NOT EXISTS bulkmailer;
USE bulkmailer;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores each user's own SMTP credentials (encrypted), optional
CREATE TABLE IF NOT EXISTS smtp_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
    smtp_port INT DEFAULT 587,
    smtp_email VARCHAR(255) NOT NULL,
    smtp_password_encrypted TEXT NOT NULL, -- Fernet-encrypted app password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    send_method ENUM('own_smtp', 'shared_service') NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(150),
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message VARCHAR(500) NULL,
    sent_at TIMESTAMP NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Basic per-user daily rate limiting (abuse prevention)
CREATE TABLE IF NOT EXISTS usage_limits (
    user_id INT NOT NULL,
    date DATE NOT NULL,
    emails_sent INT DEFAULT 0,
    PRIMARY KEY (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipients_campaign ON recipients(campaign_id);
CREATE INDEX idx_campaigns_user ON campaigns(user_id);
