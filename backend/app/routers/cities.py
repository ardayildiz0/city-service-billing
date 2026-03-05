from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.city import City
from app.schemas.city import CityCreate, CityOut
from app.middleware.auth import require_superadmin

router = APIRouter(prefix="/api/cities", tags=["cities"])


@router.post("/", response_model=CityOut)
def create_city(data: CityCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    if db.query(City).filter(City.name == data.name).first():
        raise HTTPException(status_code=400, detail="City already exists")
    city = City(name=data.name)
    db.add(city)
    db.commit()
    db.refresh(city)
    return city


@router.get("/", response_model=list[CityOut])
def list_cities(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    return db.query(City).all()


@router.delete("/{city_id}")
def delete_city(city_id: int, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    db.delete(city)
    db.commit()
    return {"detail": "Deleted"}
