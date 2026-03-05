from sqlalchemy import Column, Integer, String

from app.database import Base


class Currency(Base):
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
