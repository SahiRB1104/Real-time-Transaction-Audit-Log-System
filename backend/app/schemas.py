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
    sender_id: Optional[int] = None   # ✅ FIX
    receiver_id: int
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
