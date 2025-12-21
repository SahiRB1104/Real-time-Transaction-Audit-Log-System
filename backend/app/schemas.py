from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int                    # internal (keep)
    public_id: str             # ✅ NEW
    name: str
    email: EmailStr
    balance: Decimal

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# 🔁 TRANSFER NOW USES PUBLIC ID
class TransferRequest(BaseModel):
    receiver_public_id: str
    amount: Decimal


class TransferResponse(BaseModel):
    message: str
    sender_balance: Decimal


class TransactionHistoryResponse(BaseModel):
    id: int
    sender_public_id: Optional[str]
    receiver_public_id: str
    sender_username: Optional[str]
    receiver_username: str
    amount: Decimal
    status: str
    type: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AddBalanceRequest(BaseModel):
    amount: Decimal


class AddBalanceResponse(BaseModel):
    message: str
    new_balance: Decimal
