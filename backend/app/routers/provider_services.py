from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.provider_service import ProviderService
from app.models.subscription import Subscription
from app.models.subscription_phase import SubscriptionPhase
from app.schemas.provider_service import ProviderServiceCreate, ProviderServiceUpdate, ProviderServiceOut
from app.middleware.auth import require_superadmin

router = APIRouter(prefix="/api/provider-services", tags=["catalog"])


@router.post("/", response_model=ProviderServiceOut)
def create_provider_service(data: ProviderServiceCreate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    ps = ProviderService(**data.model_dump())
    db.add(ps)
    db.commit()
    db.refresh(ps)
    return _enrich(ps)


@router.get("/", response_model=list[ProviderServiceOut])
def list_provider_services(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    items = db.query(ProviderService).all()
    return [_enrich(ps) for ps in items]


@router.put("/{ps_id}", response_model=ProviderServiceOut)
def update_price(ps_id: int, data: ProviderServiceUpdate, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    ps = db.query(ProviderService).filter(ProviderService.id == ps_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Catalog item not found")

    old_price = ps.unit_price
    ps.unit_price = data.unit_price

    if old_price != data.unit_price:
        now = datetime.now(timezone.utc)
        active_subs = db.query(Subscription).filter(
            Subscription.provider_service_id == ps_id,
            Subscription.is_active == True,
        ).all()

        for sub in active_subs:
            current_phase = (
                db.query(SubscriptionPhase)
                .filter(SubscriptionPhase.subscription_id == sub.id, SubscriptionPhase.end_time.is_(None))
                .first()
            )
            if current_phase:
                current_phase.end_time = now

            new_phase = SubscriptionPhase(
                subscription_id=sub.id,
                provider_service_id=ps.id,
                amount=sub.amount,
                unit_price=data.unit_price,
                start_time=now,
            )
            db.add(new_phase)

    db.commit()
    db.refresh(ps)
    return _enrich(ps)


@router.delete("/{ps_id}")
def delete_provider_service(ps_id: int, db: Session = Depends(get_db), _=Depends(require_superadmin)):
    ps = db.query(ProviderService).filter(ProviderService.id == ps_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Catalog item not found")
    db.delete(ps)
    db.commit()
    return {"detail": "Deleted"}


def _enrich(ps: ProviderService) -> ProviderServiceOut:
    return ProviderServiceOut(
        id=ps.id,
        provider_id=ps.provider_id,
        service_id=ps.service_id,
        currency_id=ps.currency_id,
        unit_price=ps.unit_price,
        unit_label=ps.unit_label,
        provider_name=ps.provider.name if ps.provider else None,
        service_name=ps.service.name if ps.service else None,
        currency_code=ps.currency.code if ps.currency else None,
    )
