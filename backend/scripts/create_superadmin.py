import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.middleware.auth import hash_password

# Import all models
import app.models  # noqa: F401


def create_superadmin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    username = input("Superadmin username: ").strip()
    password = input("Superadmin password: ").strip()

    if not username or not password:
        print("Username and password cannot be empty.")
        return

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"User '{username}' already exists.")
        db.close()
        return

    user = User(
        username=username,
        password_hash=hash_password(password),
        role=UserRole.SUPERADMIN,
    )
    db.add(user)
    db.commit()
    print(f"Superadmin '{username}' created successfully.")
    db.close()


if __name__ == "__main__":
    create_superadmin()
