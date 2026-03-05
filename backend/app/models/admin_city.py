from sqlalchemy import Table, Column, Integer, ForeignKey

from app.database import Base

admin_cities = Table(
    "admin_cities",
    Base.metadata,
    Column("admin_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("city_id", Integer, ForeignKey("cities.id"), primary_key=True),
)
