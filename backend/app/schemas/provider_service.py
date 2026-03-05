from decimal import Decimal
from pydantic import BaseModel


class ProviderServiceCreate(BaseModel):
    provider_id: int
    service_id: int
    currency_id: int
    unit_price: Decimal
    unit_label: str


class ProviderServiceUpdate(BaseModel):
    unit_price: Decimal


class ProviderServiceOut(BaseModel):
    id: int
    provider_id: int
    service_id: int
    currency_id: int
    unit_price: Decimal
    unit_label: str
    provider_name: str | None = None
    service_name: str | None = None
    currency_code: str | None = None

    model_config = {"from_attributes": True}
