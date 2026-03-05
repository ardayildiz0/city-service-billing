from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ProviderService(Base):
    __tablename__ = "provider_services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=False)
    unit_price = Column(Numeric(12, 6), nullable=False)
    unit_label = Column(String, nullable=False)

    provider = relationship("Provider", back_populates="provider_services")
    service = relationship("Service", back_populates="provider_services")
    currency = relationship("Currency")
    subscriptions = relationship("Subscription", back_populates="provider_service")
