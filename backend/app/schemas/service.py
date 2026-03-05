from pydantic import BaseModel


class ServiceCreate(BaseModel):
    name: str


class ServiceOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
