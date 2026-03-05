from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.city import City
from app.schemas.user import UserCreate, UserOut, UserAssignCities
from app.middleware.auth import require_superadmin, hash_password

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/", response_model=UserOut)
def create_user(data: UserCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(username=data.username, password_hash=hash_password(data.password), role=data.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    return db.query(User).all()


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "Deleted"}


@router.post("/{user_id}/cities", response_model=UserOut)
def assign_cities(user_id: int, data: UserAssignCities, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Can only assign cities to admins")
    cities = db.query(City).filter(City.id.in_(data.city_ids)).all()
    user.cities = cities
    db.commit()
    db.refresh(user)
    return user
