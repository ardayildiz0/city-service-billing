from pydantic import BaseModel
from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.USER


class UserOut(BaseModel):
    id: int
    username: str
    role: UserRole

    model_config = {"from_attributes": True}


class UserAssignCities(BaseModel):
    city_ids: list[int]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
