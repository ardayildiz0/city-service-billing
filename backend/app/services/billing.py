from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.subscription import Subscription
from app.models.subscription_phase import SubscriptionPhase
from app.models.daily_usage import DailyUsage
from app.models.monthly_invoice import MonthlyInvoice
from app.models.tax import Tax


def calculate_daily_usage(db: Session, target_date: date):
    """Calculate daily usage for all active subscriptions for a given date."""
    day_start = datetime(target_date.year, target_date.month, target_date.day, tzinfo=timezone.utc)
    day_end = day_start + timedelta(days=1)

    subscriptions = db.query(Subscription).filter(Subscription.is_active == True).all()

    for sub in subscriptions:
        # Find all phases that overlap with this day
        phases = (
            db.query(SubscriptionPhase)
            .filter(
                SubscriptionPhase.subscription_id == sub.id,
                SubscriptionPhase.start_time < day_end,
                (SubscriptionPhase.end_time.is_(None)) | (SubscriptionPhase.end_time > day_start),
            )
            .order_by(SubscriptionPhase.start_time)
            .all()
        )

        if not phases:
            continue

        # If more than one phase in a day, use the last phase's price for the whole day
        last_phase = phases[-1]
        days_in_month = _days_in_month(target_date.year, target_date.month)
        daily_cost = (last_phase.amount * last_phase.unit_price) / Decimal(days_in_month)

        # Upsert daily usage
        existing = (
            db.query(DailyUsage)
            .filter(DailyUsage.subscription_id == sub.id, DailyUsage.date == target_date)
            .first()
        )
        if existing:
            existing.amount = last_phase.amount
            existing.unit_price = last_phase.unit_price
            existing.daily_cost = daily_cost
        else:
            usage = DailyUsage(
                subscription_id=sub.id,
                date=target_date,
                amount=last_phase.amount,
                unit_price=last_phase.unit_price,
                daily_cost=daily_cost,
            )
            db.add(usage)

    db.commit()


def generate_monthly_invoice(db: Session, city_id: int, year: int, month: int) -> MonthlyInvoice:
    """Generate or regenerate a monthly invoice for a city."""
    subs = db.query(Subscription).filter(Subscription.city_id == city_id).all()
    sub_ids = [s.id for s in subs]

    if not sub_ids:
        total_cost = Decimal("0")
    else:
        usages = (
            db.query(DailyUsage)
            .filter(
                DailyUsage.subscription_id.in_(sub_ids),
                db.func.extract("year", DailyUsage.date) == year,
                db.func.extract("month", DailyUsage.date) == month,
            )
            .all()
        )
        total_cost = sum((u.daily_cost for u in usages), Decimal("0"))

    taxes = db.query(Tax).all()
    total_tax_rate = sum((t.rate for t in taxes), Decimal("0"))
    tax_amount = total_cost * total_tax_rate / Decimal("100")
    grand_total = total_cost + tax_amount

    existing = (
        db.query(MonthlyInvoice)
        .filter(MonthlyInvoice.city_id == city_id, MonthlyInvoice.year == year, MonthlyInvoice.month == month)
        .first()
    )
    if existing:
        existing.total_cost = total_cost
        existing.tax_amount = tax_amount
        existing.grand_total = grand_total
        db.commit()
        db.refresh(existing)
        return existing

    invoice = MonthlyInvoice(
        city_id=city_id,
        year=year,
        month=month,
        total_cost=total_cost,
        tax_amount=tax_amount,
        grand_total=grand_total,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


def _days_in_month(year: int, month: int) -> int:
    if month == 12:
        return (date(year + 1, 1, 1) - date(year, 12, 1)).days
    return (date(year, month + 1, 1) - date(year, month, 1)).days
