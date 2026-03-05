from datetime import date, timedelta

from app.database import SessionLocal
from app.models.city import City
from app.services.billing import calculate_daily_usage, generate_monthly_invoice


def run_daily_usage():
    """Calculate usage for yesterday."""
    db = SessionLocal()
    try:
        yesterday = date.today() - timedelta(days=1)
        calculate_daily_usage(db, yesterday)
        print(f"Daily usage calculated for {yesterday}")
    finally:
        db.close()


def run_monthly_invoices():
    """Generate invoices for last month for all cities."""
    db = SessionLocal()
    try:
        today = date.today()
        if today.month == 1:
            year, month = today.year - 1, 12
        else:
            year, month = today.year, today.month - 1

        cities = db.query(City).all()
        for city in cities:
            generate_monthly_invoice(db, city.id, year, month)
        print(f"Monthly invoices generated for {year}-{month:02d}")
    finally:
        db.close()
