"""
Run this ONCE to generate your FERNET_KEY, then paste it into your .env file.
This key encrypts users' SMTP app passwords at rest in the database.
NEVER commit this key or lose it (losing it means old stored passwords can't be decrypted).
"""
from cryptography.fernet import Fernet

if __name__ == "__main__":
    key = Fernet.generate_key().decode()
    print("\nAdd this line to your .env file:\n")
    print(f"FERNET_KEY={key}\n")
