from sqlalchemy import Column, Integer, String, Numeric

from app.database import Base


class Tax(Base):
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    rate = Column(Numeric(5, 2), nullable=False)
