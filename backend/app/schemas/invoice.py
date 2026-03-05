from decimal import Decimal
from pydantic import BaseModel


class InvoiceOut(BaseModel):
    id: int
    city_id: int
    year: int
    month: int
    total_cost: Decimal
    tax_amount: Decimal
    grand_total: Decimal

    model_config = {"from_attributes": True}


class InvoiceRequest(BaseModel):
    city_id: int
    year: int
    month: int
