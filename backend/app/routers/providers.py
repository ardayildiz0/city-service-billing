from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.provider import Provider
from app.schemas.provider import ProviderCreate, ProviderOut
from app.middleware.auth import require_superadmin

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.post("/", response_model=ProviderOut)
def create_provider(data: ProviderCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    provider = Provider(name=data.name)
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.get("/", response_model=list[ProviderOut])
def list_providers(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    return db.query(Provider).all()


@router.delete("/{provider_id}")
def delete_provider(provider_id: int, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    db.delete(provider)
    db.commit()
    return {"detail": "Deleted"}
