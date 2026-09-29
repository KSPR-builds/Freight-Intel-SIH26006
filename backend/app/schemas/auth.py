from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str
    is_admin_login: bool = False

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    organization: Optional[str] = "Maritime Freight Corp"
    is_admin: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str
    email: str
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    organization: str
    is_active: bool
    is_admin: bool
    role_name: str
    created_at: datetime

    class Config:
        from_attributes = True
