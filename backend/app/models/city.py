from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.admin_city import admin_cities


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    admins = relationship("User", secondary=admin_cities, back_populates="cities")
    subscriptions = relationship("Subscription", back_populates="city")
