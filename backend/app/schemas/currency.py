from pydantic import BaseModel


class CurrencyCreate(BaseModel):
    name: str
    code: str


class CurrencyOut(BaseModel):
    id: int
    name: str
    code: str

    model_config = {"from_attributes": True}
