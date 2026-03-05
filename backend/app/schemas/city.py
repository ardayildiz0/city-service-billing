from pydantic import BaseModel


class CityCreate(BaseModel):
    name: str


class CityOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
