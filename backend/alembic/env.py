import os
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

load_dotenv()

# This is the Alembic Config object, which provides access to values within
# the alembic.ini file.
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import Base and all models so SQLAlchemy knows what tables exist.
# Any model imported here will be included in autogenerate comparisons.
from app.core.database import Base  # noqa: E402
import app.models.ticket  # noqa: E402, F401

target_metadata = Base.metadata


def get_url() -> str:
    url = os.getenv("DATABASE_URL", "")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return url


def run_migrations_offline() -> None:
    """Run migrations without an active DB connection (emits SQL to stdout)."""
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
