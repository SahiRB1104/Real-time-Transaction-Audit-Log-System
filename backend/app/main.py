from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from decimal import Decimal
import os

from .database import engine, get_db
from . import models, schemas
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_fast,
)
from .models import Transaction

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Real-time Transaction & Audit Log System")

# ✅ CORS - Environment-based configuration
# Allow localhost for development AND deployed frontend for production
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local Vite dev server
    "http://localhost:3000",  # Alternative dev port
    "https://real-time-transaction-audit-log-sys.vercel.app",  # Deployed frontend
]

# Add RENDER_EXTERNAL_URL if running on Render (for self-requests during deployment)
if os.getenv("RENDER_EXTERNAL_URL"):
    ALLOWED_ORIGINS.append(os.getenv("RENDER_EXTERNAL_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ SAFE DB INIT (runs AFTER app loads)
@app.on_event("startup")
def startup_event():
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database connected & tables ensured")
    except Exception as e:
        print("❌ Database connection failed:", e)

# ================= ROOT =================
@app.get("/")
def root():
    return {"status": "Backend running successfully"}


# ================= REGISTER =================
@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        balance=Decimal("0.00"),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ================= LOGIN =================
@app.post("/login", response_model=schemas.TokenResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if not db_user or not verify_password(
        user.password, db_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"user_id": db_user.id})

    return {"access_token": token}


# ================= FUND TRANSFER =================
# ================= FUND TRANSFER =================
@app.post("/transfer", response_model=schemas.TransferResponse)
def transfer_funds(
    transfer: schemas.TransferRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # ❌ Invalid amount
    if transfer.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    try:
        # 🔒 Lock sender row
        sender = db.execute(
            select(models.User)
            .where(models.User.id == current_user.id)
            .with_for_update()
        ).scalar_one()

        # 🔒 Lock receiver row
        receiver = db.execute(
            select(models.User)
            .where(models.User.public_id == transfer.receiver_public_id)
            .with_for_update()
        ).scalar_one_or_none()

        # ❌ Receiver not found
        if receiver is None:
            failed_tx = models.Transaction(
                sender_id=sender.id,
                receiver_id=sender.id,  # dummy FK
                sender_public_id=sender.public_id,
                receiver_public_id=transfer.receiver_public_id,
                sender_username=sender.name,
                receiver_username="UNKNOWN",
                amount=transfer.amount,
                status="FAILED",
                type="TRANSFER"
            )
            db.add(failed_tx)
            db.commit()
            raise HTTPException(status_code=404, detail="Receiver not found")

        # ❌ Self-transfer
        if sender.id == receiver.id:
            raise HTTPException(status_code=400, detail="Cannot transfer to self")

        # ❌ Insufficient balance (CRITICAL FIX)
        if sender.balance < transfer.amount:
            failed_tx = models.Transaction(
                sender_id=sender.id,
                receiver_id=receiver.id,
                sender_public_id=sender.public_id,
                receiver_public_id=receiver.public_id,
                sender_username=sender.name,
                receiver_username=receiver.name,
                amount=transfer.amount,
                status="FAILED",
                type="TRANSFER"
            )
            db.add(failed_tx)
            db.commit()
            raise HTTPException(status_code=400, detail="Insufficient balance")

        # ✅ ATOMIC DEBIT + CREDIT
        sender.balance -= transfer.amount
        receiver.balance += transfer.amount

        success_tx = models.Transaction(
            sender_id=sender.id,
            receiver_id=receiver.id,
            sender_public_id=sender.public_id,
            receiver_public_id=receiver.public_id,
            sender_username=sender.name,
            receiver_username=receiver.name,
            amount=transfer.amount,
            status="SUCCESS",
            type="TRANSFER"
        )

        db.add(success_tx)
        db.commit()

        return {
            "message": "Transfer successful",
            "sender_balance": sender.balance
        }

    except HTTPException:
        # ⚠️ Business errors already handled
        raise

    except Exception:
        # 🔥 HARD SAFETY NET
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Transaction failed due to server error"
        )




# ================= TRANSACTION HISTORY =================
@app.get(
    "/transactions",
    response_model=list[schemas.TransactionHistoryResponse],
)
def transaction_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    history = (
        db.query(models.Transaction)
        .filter(
            (models.Transaction.sender_id == current_user.id)
            | (models.Transaction.receiver_id == current_user.id)
        )
        .order_by(models.Transaction.timestamp.desc())
        .all()
    )

    return history

@app.post("/add-balance", response_model=schemas.AddBalanceResponse)
def add_balance(
    data: schemas.AddBalanceRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero"
        )

    try:
        # 1️⃣ Update balance
        current_user.balance += data.amount

        # 2️⃣ Create audit transaction (SYSTEM → USER)
        transaction = models.Transaction(
            sender_id=None,                     # SYSTEM
            receiver_id=current_user.id,

            sender_public_id=None,
            receiver_public_id=current_user.public_id,

            sender_username=None,
            receiver_username=current_user.name,

            amount=data.amount,
            status="SUCCESS",
            type="TOP_UP"
        )


        db.add(transaction)
        db.commit()
        db.refresh(current_user)

        return {
            "message": "Balance added successfully",
            "new_balance": current_user.balance
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to add balance"
        )



@app.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user_fast)):
    """Get current user info - uses optimized fast auth without locking"""
    return current_user
