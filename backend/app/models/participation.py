from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ParticipationStatus(StrEnum):
    JOINED = "joined"
    CANCELLED = "cancelled"


class Participation(Base):
    __tablename__ = "participations"
    __table_args__ = (UniqueConstraint("event_id", "user_id", name="uq_participations_event_user"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default=ParticipationStatus.JOINED.value, server_default="joined", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    event: Mapped["Event"] = relationship(back_populates="participations")
    user: Mapped["User"] = relationship(back_populates="participations")
