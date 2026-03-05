from sqlalchemy import Column, Integer, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    provider_service_id = Column(Integer, ForeignKey("provider_services.id"), nullable=False)
    amount = Column(Numeric(14, 4), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    city = relationship("City", back_populates="subscriptions")
    provider_service = relationship("ProviderService", back_populates="subscriptions")
    phases = relationship("SubscriptionPhase", back_populates="subscription", order_by="SubscriptionPhase.start_time")
