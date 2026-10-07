"""Create users and scan report storage."""

from alembic import op
import sqlalchemy as sa


revision = "0001_users_reports"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("result_json", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("reports_created_at_idx", "reports", ["created_at"])
    op.create_index("reports_user_id_idx", "reports", ["user_id"])


def downgrade() -> None:
    op.drop_index("reports_user_id_idx", table_name="reports")
    op.drop_index("reports_created_at_idx", table_name="reports")
    op.drop_table("reports")
    op.drop_table("users")
