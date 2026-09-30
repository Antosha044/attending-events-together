from datetime import datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EventStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"


class Event(Base):
    __tablename__ = "events"
    __table_args__ = (CheckConstraint("capacity > 0", name="ck_events_capacity_positive"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    venue: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str | None] = mapped_column(String(300))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=EventStatus.PUBLISHED.value, server_default="published", nullable=False)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    creator: Mapped["User"] = relationship(back_populates="created_events")
    participations: Mapped[list["Participation"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    messages: Mapped[list["Message"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    attendances: Mapped[list["Attendance"]] = relationship(back_populates="event", cascade="all, delete-orphan")
