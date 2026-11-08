import uuid

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.models.ticket import Priority, Status, Ticket


class TestTicketTableDefinition:
    def test_tablename(self):
        assert Ticket.__tablename__ == "tickets"

    def test_all_columns_present(self):
        expected = {
            "id", "subject", "description", "customer_email",
            "category", "priority", "status", "created_at", "updated_at",
        }
        assert set(Ticket.__table__.columns.keys()) == expected

    def test_id_is_primary_key(self):
        col = Ticket.__table__.columns["id"]
        assert col.primary_key

    def test_id_is_uuid_type(self):
        col = Ticket.__table__.columns["id"]
        assert isinstance(col.type, PG_UUID)

    def test_subject_max_length(self):
        col = Ticket.__table__.columns["subject"]
        assert isinstance(col.type, String)
        assert col.type.length == 200

    def test_subject_not_nullable(self):
        assert not Ticket.__table__.columns["subject"].nullable

    def test_description_is_text(self):
        col = Ticket.__table__.columns["description"]
        assert isinstance(col.type, Text)

    def test_description_not_nullable(self):
        assert not Ticket.__table__.columns["description"].nullable

    def test_customer_email_max_length(self):
        col = Ticket.__table__.columns["customer_email"]
        assert col.type.length == 254

    def test_customer_email_not_nullable(self):
        assert not Ticket.__table__.columns["customer_email"].nullable

    def test_category_is_nullable(self):
        assert Ticket.__table__.columns["category"].nullable

    def test_category_max_length(self):
        col = Ticket.__table__.columns["category"]
        assert col.type.length == 100

    def test_priority_not_nullable(self):
        assert not Ticket.__table__.columns["priority"].nullable

    def test_status_not_nullable(self):
        assert not Ticket.__table__.columns["status"].nullable

    def test_created_at_is_timezone_aware(self):
        col = Ticket.__table__.columns["created_at"]
        assert isinstance(col.type, DateTime)
        assert col.type.timezone is True

    def test_updated_at_is_timezone_aware(self):
        col = Ticket.__table__.columns["updated_at"]
        assert isinstance(col.type, DateTime)
        assert col.type.timezone is True

    def test_updated_at_has_onupdate(self):
        col = Ticket.__table__.columns["updated_at"]
        assert col.onupdate is not None


class TestEnumReuse:
    def test_schemas_import_model_enums(self):
        from app.schemas.ticket import Priority as SchemaPriority
        from app.models.ticket import Priority as ModelPriority
        assert SchemaPriority is ModelPriority

    def test_schemas_import_model_status(self):
        from app.schemas.ticket import Status as SchemaStatus
        from app.models.ticket import Status as ModelStatus
        assert SchemaStatus is ModelStatus

    def test_priority_values(self):
        assert [p.value for p in Priority] == ["low", "medium", "high", "critical"]

    def test_status_values(self):
        assert [s.value for s in Status] == ["open", "in_progress", "resolved", "closed"]

    def test_priority_is_string_enum(self):
        assert isinstance(Priority.medium, str)

    def test_status_is_string_enum(self):
        assert isinstance(Status.open, str)


class TestTicketDefaults:
    def test_priority_column_default(self):
        col = Ticket.__table__.columns["priority"]
        assert col.default.arg == Priority.medium

    def test_status_column_default(self):
        col = Ticket.__table__.columns["status"]
        assert col.default.arg == Status.open
