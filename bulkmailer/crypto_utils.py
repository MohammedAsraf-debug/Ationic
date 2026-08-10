from cryptography.fernet import Fernet
from config import Config

if not Config.FERNET_KEY:
    raise RuntimeError(
        "FERNET_KEY not set. Run `python generate_key.py` and add the key to your .env file."
    )

_fernet = Fernet(Config.FERNET_KEY.encode())


def encrypt(plain_text: str) -> str:
    return _fernet.encrypt(plain_text.encode()).decode()


def decrypt(encrypted_text: str) -> str:
    return _fernet.decrypt(encrypted_text.encode()).decode()
