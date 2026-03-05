from pydantic import BaseModel


class ProviderCreate(BaseModel):
    name: str


class ProviderOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
