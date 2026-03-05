from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.subscription import Subscription
from app.models.daily_usage import DailyUsage
from app.models.city import City
from app.schemas.invoice import InvoiceOut, InvoiceRequest
from app.middleware.auth import require_admin_or_superadmin, get_current_user
from app.services.billing import generate_monthly_invoice

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _check_city_access(user: User, city_id: int):
    if user.role == UserRole.SUPERADMIN:
        return
    allowed_ids = {c.id for c in user.cities}
    if city_id not in allowed_ids:
        raise HTTPException(status_code=403, detail="No access to this city")


@router.get("/usage")
def get_usage_data(year: int, month: int, city_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_superadmin)):
    """Get usage data grouped by city for pie chart."""
    if current_user.role == UserRole.ADMIN:
        allowed_ids = [c.id for c in current_user.cities]
    else:
        if city_id:
            allowed_ids = [city_id]
        else:
            allowed_ids = [c.id for c in db.query(City).all()]

    if city_id:
        _check_city_access(current_user, city_id)
        allowed_ids = [city_id]

    results = []
    for cid in allowed_ids:
        subs = db.query(Subscription).filter(Subscription.city_id == cid).all()
        sub_ids = [s.id for s in subs]
        if not sub_ids:
            continue

        total = (
            db.query(func.sum(DailyUsage.daily_cost))
            .filter(
                DailyUsage.subscription_id.in_(sub_ids),
                func.extract("year", DailyUsage.date) == year,
                func.extract("month", DailyUsage.date) == month,
            )
            .scalar()
        ) or Decimal("0")

        city = db.query(City).filter(City.id == cid).first()
        results.append({
            "city_id": cid,
            "city_name": city.name if city else "Unknown",
            "total_cost": float(total),
        })

    return results


@router.post("/invoices", response_model=InvoiceOut)
def create_invoice(data: InvoiceRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_superadmin)):
    _check_city_access(current_user, data.city_id)
    invoice = generate_monthly_invoice(db, data.city_id, data.year, data.month)
    return invoice


@router.get("/invoices", response_model=list[InvoiceOut])
def list_invoices(city_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_superadmin)):
    from app.models.monthly_invoice import MonthlyInvoice

    query = db.query(MonthlyInvoice)
    if current_user.role == UserRole.ADMIN:
        allowed_ids = [c.id for c in current_user.cities]
        query = query.filter(MonthlyInvoice.city_id.in_(allowed_ids))
    if city_id:
        _check_city_access(current_user, city_id)
        query = query.filter(MonthlyInvoice.city_id == city_id)
    return query.all()
