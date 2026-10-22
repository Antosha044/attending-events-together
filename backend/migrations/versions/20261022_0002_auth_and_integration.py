"""Add authentication and frontend event fields.

Revision ID: 20261022_0002
Revises: 20260930_0001
Create Date: 2026-10-22
"""
from alembic import op
import sqlalchemy as sa

revision = "20261022_0002"
down_revision = "20260930_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(length=256), nullable=True))
    op.execute("UPDATE users SET password_hash = 'disabled$legacy-account' WHERE password_hash IS NULL")
    op.alter_column("users", "password_hash", existing_type=sa.String(length=256), nullable=False)
    op.add_column("users", sa.Column("city", sa.String(length=100), server_default="Москва", nullable=False))
    op.add_column("events", sa.Column("category", sa.String(length=80), server_default="Другое", nullable=False))
    op.add_column("events", sa.Column("city", sa.String(length=100), server_default="Москва", nullable=False))
    op.add_column("events", sa.Column("price", sa.String(length=40), server_default="Бесплатно", nullable=False))
    op.add_column("events", sa.Column("image", sa.Text(), server_default="", nullable=False))
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_token_hash", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_column("events", "image")
    op.drop_column("events", "price")
    op.drop_column("events", "city")
    op.drop_column("events", "category")
    op.drop_column("users", "city")
    op.drop_column("users", "password_hash")
