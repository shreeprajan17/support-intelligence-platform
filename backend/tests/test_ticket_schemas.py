from datetime import datetime, timezone
from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from app.schemas.ticket import (
    Priority,
    Status,
    TicketCreate,
    TicketListResponse,
    TicketResponse,
    TicketUpdate,
)


def valid_create_data(**overrides):
    data = {
        "subject": "Login button not working",
        "description": "Clicking login does nothing on Chrome 120",
        "customer_email": "user@example.com",
    }
    data.update(overrides)
    return data


def mock_orm(**overrides):
    class FakeTicket:
        id = uuid4()
        subject = "Test ticket"
        description = "Test description"
        customer_email = "user@example.com"
        category = "billing"
        priority = Priority.medium
        status = Status.open
        created_at = datetime.now(timezone.utc)
        updated_at = datetime.now(timezone.utc)

    obj = FakeTicket()
    for k, v in overrides.items():
        setattr(obj, k, v)
    return obj


# ---------------------------------------------------------------------------
# TicketCreate
# ---------------------------------------------------------------------------

class TestTicketCreate:
    def test_valid_minimal(self):
        t = TicketCreate(**valid_create_data())
        assert t.subject == "Login button not working"
        assert t.priority == Priority.medium
        assert t.category is None

    def test_priority_defaults_to_medium(self):
        t = TicketCreate(**valid_create_data())
        assert t.priority == Priority.medium

    def test_explicit_priority(self):
        t = TicketCreate(**valid_create_data(priority="critical"))
        assert t.priority == Priority.critical

    def test_invalid_priority(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(priority="urgent"))

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(customer_email="not-an-email"))

    def test_subject_too_long(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(subject="x" * 201))

    def test_subject_empty(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(subject=""))

    def test_description_empty(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(description=""))

    def test_category_max_length(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(category="x" * 101))

    def test_category_at_max_length(self):
        t = TicketCreate(**valid_create_data(category="x" * 100))
        assert len(t.category) == 100

    def test_missing_subject(self):
        with pytest.raises(ValidationError):
            TicketCreate(description="desc", customer_email="a@b.com")

    def test_missing_email(self):
        with pytest.raises(ValidationError):
            TicketCreate(subject="Sub", description="desc")

    def test_rejects_status_field(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(status="open"))

    def test_rejects_id_field(self):
        with pytest.raises(ValidationError):
            TicketCreate(**valid_create_data(id=str(uuid4())))

    def test_no_status_attribute(self):
        t = TicketCreate(**valid_create_data())
        assert not hasattr(t, "status")


# ---------------------------------------------------------------------------
# TicketUpdate
# ---------------------------------------------------------------------------

class TestTicketUpdate:
    def test_partial_update_subject_only(self):
        t = TicketUpdate(subject="New subject")
        assert t.subject == "New subject"
        assert "description" not in t.model_fields_set

    def test_partial_update_status_only(self):
        t = TicketUpdate(status="resolved")
        assert t.status == Status.resolved

    def test_multiple_fields(self):
        t = TicketUpdate(subject="Updated", priority="high", status="in_progress")
        assert t.subject == "Updated"
        assert t.priority == Priority.high
        assert t.status == Status.in_progress

    def test_empty_update_rejected(self):
        with pytest.raises(ValidationError, match="at least one field"):
            TicketUpdate()

    def test_category_can_be_null(self):
        t = TicketUpdate(category=None)
        assert t.category is None
        assert "category" in t.model_fields_set

    def test_subject_cannot_be_null(self):
        with pytest.raises(ValidationError, match="cannot be set to null"):
            TicketUpdate(subject=None)

    def test_description_cannot_be_null(self):
        with pytest.raises(ValidationError, match="cannot be set to null"):
            TicketUpdate(description=None)

    def test_priority_cannot_be_null(self):
        with pytest.raises(ValidationError, match="cannot be set to null"):
            TicketUpdate(priority=None)

    def test_status_cannot_be_null(self):
        with pytest.raises(ValidationError, match="cannot be set to null"):
            TicketUpdate(status=None)

    def test_omitted_fields_not_in_fields_set(self):
        t = TicketUpdate(subject="New subject")
        assert "subject" in t.model_fields_set
        assert "description" not in t.model_fields_set
        assert "priority" not in t.model_fields_set

    def test_invalid_status_value(self):
        with pytest.raises(ValidationError):
            TicketUpdate(status="pending")

    def test_invalid_priority_value(self):
        with pytest.raises(ValidationError):
            TicketUpdate(priority="urgent")


# ---------------------------------------------------------------------------
# TicketResponse
# ---------------------------------------------------------------------------

class TestTicketResponse:
    def test_from_orm_object(self):
        r = TicketResponse.model_validate(mock_orm())
        assert r.subject == "Test ticket"
        assert r.status == Status.open
        assert r.priority == Priority.medium

    def test_category_can_be_none(self):
        r = TicketResponse.model_validate(mock_orm(category=None))
        assert r.category is None

    def test_id_is_uuid(self):
        r = TicketResponse.model_validate(mock_orm())
        assert isinstance(r.id, UUID)

    def test_timestamps_present(self):
        r = TicketResponse.model_validate(mock_orm())
        assert isinstance(r.created_at, datetime)
        assert isinstance(r.updated_at, datetime)


# ---------------------------------------------------------------------------
# TicketListResponse
# ---------------------------------------------------------------------------

class TestTicketListResponse:
    def _make_response(self):
        return TicketResponse(
            id=uuid4(),
            subject="Test",
            description="Desc",
            customer_email="a@b.com",
            category=None,
            priority=Priority.low,
            status=Status.open,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def test_valid_list(self):
        result = TicketListResponse(
            items=[self._make_response()], total=1, skip=0, limit=20
        )
        assert result.total == 1
        assert len(result.items) == 1

    def test_empty_list(self):
        result = TicketListResponse(items=[], total=0, skip=0, limit=20)
        assert result.total == 0
        assert result.items == []

    def test_pagination_fields(self):
        result = TicketListResponse(
            items=[], total=100, skip=40, limit=20
        )
        assert result.skip == 40
        assert result.limit == 20


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class TestEnums:
    def test_all_priority_values(self):
        assert set(p.value for p in Priority) == {"low", "medium", "high", "critical"}

    def test_all_status_values(self):
        assert set(s.value for s in Status) == {"open", "in_progress", "resolved", "closed"}

    def test_priority_is_string_enum(self):
        assert isinstance(Priority.high, str)
        assert Priority.high == "high"

    def test_status_is_string_enum(self):
        assert isinstance(Status.open, str)
        assert Status.open == "open"
