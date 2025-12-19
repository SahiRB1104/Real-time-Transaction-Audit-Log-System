from pydantic import BaseModel, EmailStr
from decimal import Decimal


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    balance: Decimal

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
from datetime import datetime
from decimal import Decimal


class TransferRequest(BaseModel):
    receiver_id: int
    amount: Decimal


class TransferResponse(BaseModel):
    message: str
    sender_balance: Decimal


class TransactionHistoryResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    amount: Decimal
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True

