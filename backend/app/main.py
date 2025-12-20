from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from decimal import Decimal

from .database import engine, get_db
from . import models, schemas
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

app = FastAPI(title="Real-time Transaction & Audit Log System")

# Create tables
models.Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],   # VERY IMPORTANT
    allow_headers=["*"],   # VERY IMPORTANT
)


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
@app.post("/transfer", response_model=schemas.TransferResponse)
def transfer_funds(
    transfer: schemas.TransferRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if transfer.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    try:
        sender = db.execute(
            select(models.User)
            .where(models.User.id == current_user.id)
            .with_for_update()
        ).scalar_one()

        receiver = db.execute(
            select(models.User)
            .where(models.User.id == transfer.receiver_id)
            .with_for_update()
        ).scalar_one_or_none()
        
        # ❌ Prevent self-transfer
        if transfer.receiver_id == current_user.id:
            db.add(models.Transaction(
                sender_id=current_user.id,
                receiver_id=transfer.receiver_id,
                amount=transfer.amount,
                status="FAILED"
            ))
            db.commit()

            raise HTTPException(
                status_code=400,
                detail="You cannot transfer money to your own account"
            )

        # ❌ Receiver not found → FAILED LOG
        if receiver is None:
            db.add(models.Transaction(
                sender_id=sender.id,
                receiver_id=transfer.receiver_id,
                amount=transfer.amount,
                status="FAILED"
            ))
            db.commit()
            raise HTTPException(status_code=404, detail="Receiver not found")

        # ❌ Insufficient balance → FAILED LOG
        if sender.balance < transfer.amount:
            db.add(models.Transaction(
                sender_id=sender.id,
                receiver_id=receiver.id,
                amount=transfer.amount,
                status="FAILED"
            ))
            db.commit()
            raise HTTPException(status_code=400, detail="Insufficient balance")

        # ✅ SUCCESS
        sender.balance -= transfer.amount
        receiver.balance += transfer.amount

        db.add(models.Transaction(
            sender_id=sender.id,
            receiver_id=receiver.id,
            amount=transfer.amount,
            status="SUCCESS"
        ))

        db.commit()

        return {
            "message": "Transfer successful",
            "sender_balance": sender.balance
        }

    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transaction failed")



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
            sender_id=None,              # SYSTEM
            receiver_id=current_user.id,
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
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
