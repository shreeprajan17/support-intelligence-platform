import os

# Ensure a valid DATABASE_URL is always present when running tests so that
# SQLAlchemy's create_engine() does not fail on import. The engine does not
# actually connect until a query is executed, so a dummy URL is sufficient
# for model-definition and schema tests that never touch the database.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://test:test@localhost:5432/test",
)
