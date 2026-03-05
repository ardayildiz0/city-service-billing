from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.subscription import Subscription
from app.models.subscription_phase import SubscriptionPhase
from app.models.provider_service import ProviderService
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdateAmount, SubscriptionOut
from app.middleware.auth import require_admin_or_superadmin, get_current_user

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


def _check_city_access(user: User, city_id: int):
    if user.role == UserRole.SUPERADMIN:
        return
    allowed_ids = {c.id for c in user.cities}
    if city_id not in allowed_ids:
        raise HTTPException(status_code=403, detail="No access to this city")


@router.post("/", response_model=SubscriptionOut)
def create_subscription(data: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_superadmin)):
    _check_city_access(current_user, data.city_id)

    ps = db.query(ProviderService).filter(ProviderService.id == data.provider_service_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Catalog item not found")

    now = datetime.now(timezone.utc)

    sub = Subscription(city_id=data.city_id, provider_service_id=data.provider_service_id, amount=data.amount)
    db.add(sub)
    db.flush()

    phase = SubscriptionPhase(
        subscription_id=sub.id,
        provider_service_id=ps.id,
        amount=data.amount,
        unit_price=ps.unit_price,
        start_time=now,
    )
    db.add(phase)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/", response_model=list[SubscriptionOut])
def list_subscriptions(city_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_superadmin)):
    query = db.query(Subscription)
    if current_user.role == UserRole.ADMIN:
        allowed_ids = [c.id for c in current_user.cities]
        query = query.filter(Subscription.city_id.in_(allowed_ids))
    if city_id is not None:
        _check_city_access(current_user, city_id)
        query = query.filter(Subscription.city_id == city_id)
    return query.all()


@router.put("/{sub_id}/amount", response_model=SubscriptionOut)
def update_amount(sub_id: int, data: SubscriptionUpdateAmount, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_superadmin)):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    _check_city_access(current_user, sub.city_id)

    now = datetime.now(timezone.utc)

    current_phase = (
        db.query(SubscriptionPhase)
        .filter(SubscriptionPhase.subscription_id == sub.id, SubscriptionPhase.end_time.is_(None))
        .first()
    )
    if current_phase:
        current_phase.end_time = now

    ps = db.query(ProviderService).filter(ProviderService.id == sub.provider_service_id).first()

    new_phase = SubscriptionPhase(
        subscription_id=sub.id,
        provider_service_id=ps.id,
        amount=data.amount,
        unit_price=ps.unit_price,
        start_time=now,
    )
    db.add(new_phase)

    sub.amount = data.amount
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/{sub_id}")
def cancel_subscription(sub_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_superadmin)):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    _check_city_access(current_user, sub.city_id)

    now = datetime.now(timezone.utc)
    current_phase = (
        db.query(SubscriptionPhase)
        .filter(SubscriptionPhase.subscription_id == sub.id, SubscriptionPhase.end_time.is_(None))
        .first()
    )
    if current_phase:
        current_phase.end_time = now

    sub.is_active = False
    db.commit()
    return {"detail": "Subscription cancelled"}
