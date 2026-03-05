from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceOut
from app.middleware.auth import require_superadmin

router = APIRouter(prefix="/api/services", tags=["services"])


@router.post("/", response_model=ServiceOut)
def create_service(data: ServiceCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    service = Service(name=data.name)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.get("/", response_model=list[ServiceOut])
def list_services(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    return db.query(Service).all()


@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return {"detail": "Deleted"}
