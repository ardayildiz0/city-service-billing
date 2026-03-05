from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tax import Tax
from app.schemas.tax import TaxCreate, TaxOut
from app.middleware.auth import require_superadmin

router = APIRouter(prefix="/api/taxes", tags=["taxes"])


@router.post("/", response_model=TaxOut)
def create_tax(data: TaxCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    tax = Tax(name=data.name, rate=data.rate)
    db.add(tax)
    db.commit()
    db.refresh(tax)
    return tax


@router.get("/", response_model=list[TaxOut])
def list_taxes(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    return db.query(Tax).all()


@router.put("/{tax_id}", response_model=TaxOut)
def update_tax(tax_id: int, data: TaxCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    tax = db.query(Tax).filter(Tax.id == tax_id).first()
    if not tax:
        raise HTTPException(status_code=404, detail="Tax not found")
    tax.name = data.name
    tax.rate = data.rate
    db.commit()
    db.refresh(tax)
    return tax


@router.delete("/{tax_id}")
def delete_tax(tax_id: int, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    tax = db.query(Tax).filter(Tax.id == tax_id).first()
    if not tax:
        raise HTTPException(status_code=404, detail="Tax not found")
    db.delete(tax)
    db.commit()
    return {"detail": "Deleted"}
