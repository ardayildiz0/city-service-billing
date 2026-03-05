from decimal import Decimal
from pydantic import BaseModel


class SubscriptionCreate(BaseModel):
    city_id: int
    provider_service_id: int
    amount: Decimal


class SubscriptionUpdateAmount(BaseModel):
    amount: Decimal


class SubscriptionOut(BaseModel):
    id: int
    city_id: int
    provider_service_id: int
    amount: Decimal
    is_active: bool

    model_config = {"from_attributes": True}
