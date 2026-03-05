from decimal import Decimal
from pydantic import BaseModel


class TaxCreate(BaseModel):
    name: str
    rate: Decimal


class TaxOut(BaseModel):
    id: int
    name: str
    rate: Decimal

    model_config = {"from_attributes": True}
