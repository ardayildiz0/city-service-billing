from sqlalchemy import Column, Integer, Numeric, Date, ForeignKey

from app.database import Base


class DailyUsage(Base):
    __tablename__ = "daily_usages"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    date = Column(Date, nullable=False)
    amount = Column(Numeric(14, 4), nullable=False)
    unit_price = Column(Numeric(12, 6), nullable=False)
    daily_cost = Column(Numeric(14, 6), nullable=False)
