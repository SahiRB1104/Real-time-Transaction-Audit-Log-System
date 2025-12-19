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
    current_user: models.User = Depends(get_current_user),
):
    if transfer.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    try:
        sender: models.User = db.execute(
            select(models.User)
            .where(models.User.id == current_user.id)
            .with_for_update()
        ).scalar_one()

        receiver: models.User | None = db.execute(
            select(models.User)
            .where(models.User.id == transfer.receiver_id)
            .with_for_update()
        ).scalar_one_or_none()

        if receiver is None:
            raise HTTPException(status_code=404, detail="Receiver not found")

        sender_balance = Decimal(sender.balance or 0)
        receiver_balance = Decimal(receiver.balance or 0)
        transfer_amount = Decimal(transfer.amount)

        if sender_balance < transfer_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        sender.balance = sender_balance - transfer_amount
        receiver.balance = receiver_balance + transfer_amount

        transaction = models.Transaction(
            sender_id=sender.id,
            receiver_id=receiver.id,
            amount=transfer_amount,
            status="SUCCESS",
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return {
            "message": "Transfer successful",
            "sender_balance": sender.balance,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        print("TRANSFER ERROR:", e)
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
