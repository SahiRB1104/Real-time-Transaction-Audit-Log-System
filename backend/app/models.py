from decimal import Decimal
from datetime import datetime
import uuid

from sqlalchemy import ForeignKey, Numeric, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ✅ NEW: Public, sharable ID
    public_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
        default=lambda: uuid.uuid4().hex[:12]  # short & user-friendly
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    balance: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    sent_transactions = relationship(
        "Transaction",
        foreign_keys="Transaction.sender_id",
        back_populates="sender",
    )

    received_transactions = relationship(
        "Transaction",
        foreign_keys="Transaction.receiver_id",
        back_populates="receiver",
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    sender_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )
    receiver_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    # ✅ AUDIT SNAPSHOT (DO NOT RELY ON JOINS)
    sender_public_id: Mapped[str | None] = mapped_column(String, nullable=True)
    receiver_public_id: Mapped[str] = mapped_column(String, nullable=False)
    sender_username: Mapped[str | None] = mapped_column(String, nullable=True)
    receiver_username: Mapped[str] = mapped_column(String, nullable=False)

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False, default="TRANSFER")

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_transactions",
    )
    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="received_transactions",
    )
