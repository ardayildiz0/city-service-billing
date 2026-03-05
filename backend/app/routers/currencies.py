from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.currency import Currency
from app.schemas.currency import CurrencyCreate, CurrencyOut
from app.middleware.auth import require_superadmin

router = APIRouter(prefix="/api/currencies", tags=["currencies"])


@router.post("/", response_model=CurrencyOut)
def create_currency(data: CurrencyCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    currency = Currency(name=data.name, code=data.code)
    db.add(currency)
    db.commit()
    db.refresh(currency)
    return currency


@router.get("/", response_model=list[CurrencyOut])
def list_currencies(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    return db.query(Currency).all()


@router.delete("/{currency_id}")
def delete_currency(currency_id: int, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    currency = db.query(Currency).filter(Currency.id == currency_id).first()
    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")
    db.delete(currency)
    db.commit()
    return {"detail": "Deleted"}
