from sqlalchemy import Column, Integer, Numeric, ForeignKey

from app.database import Base


class MonthlyInvoice(Base):
    __tablename__ = "monthly_invoices"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    total_cost = Column(Numeric(14, 6), nullable=False)
    tax_amount = Column(Numeric(14, 6), nullable=False)
    grand_total = Column(Numeric(14, 6), nullable=False)
