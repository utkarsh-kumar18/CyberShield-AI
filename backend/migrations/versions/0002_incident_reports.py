"""Add authenticated incident report intake."""

from alembic import op
import sqlalchemy as sa


revision = "0002_incident_reports"
down_revision = "0001_users_reports"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "incident_reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("fraud_type", sa.String(length=40), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("website", sa.String(length=2048)),
        sa.Column("contact", sa.String(length=80)),
        sa.Column("amount_lost", sa.Numeric(14, 2)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("incident_reports_user_created_idx", "incident_reports", ["user_id", "created_at"])


def downgrade() -> None:
    op.drop_index("incident_reports_user_created_idx", table_name="incident_reports")
    op.drop_table("incident_reports")
