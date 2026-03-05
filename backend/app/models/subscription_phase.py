from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class SubscriptionPhase(Base):
    __tablename__ = "subscription_phases"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    provider_service_id = Column(Integer, ForeignKey("provider_services.id"), nullable=False)
    amount = Column(Numeric(14, 4), nullable=False)
    unit_price = Column(Numeric(12, 6), nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)

    subscription = relationship("Subscription", back_populates="phases")
    provider_service = relationship("ProviderService")
