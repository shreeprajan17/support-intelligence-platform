from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.main import app
from app.models.ticket import Priority, Status
from app.schemas.ticket import TicketResponse
from app.services.ticket import TicketNotFound

client = TestClient(app)


def _make_response(**overrides) -> TicketResponse:
    """Build a TicketResponse with sensible defaults."""
    defaults = dict(
        id=uuid4(),
        subject="Test subject",
        description="Test description",
        customer_email="user@example.com",
        category=None,
        priority=Priority.medium,
        status=Status.open,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    defaults.update(overrides)
    return TicketResponse(**defaults)


@pytest.fixture(autouse=True)
def override_db():
    """Replace the real DB session with a MagicMock for every test."""
    app.dependency_overrides[get_db] = lambda: MagicMock()
    yield
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# POST /api/v1/tickets
# ---------------------------------------------------------------------------

class TestCreateTicket:
    PAYLOAD = {
        "subject": "Login broken",
        "description": "Cannot log in since the last deploy.",
        "customer_email": "alice@example.com",
    }

    def test_returns_201_on_success(self):
        ticket = _make_response(subject="Login broken", customer_email="alice@example.com")
        with patch("app.routes.tickets.ticket_service.create_ticket", return_value=ticket):
            response = client.post("/api/v1/tickets", json=self.PAYLOAD)
        assert response.status_code == 201

    def test_response_body_matches_created_ticket(self):
        ticket = _make_response(subject="Login broken", customer_email="alice@example.com")
        with patch("app.routes.tickets.ticket_service.create_ticket", return_value=ticket):
            response = client.post("/api/v1/tickets", json=self.PAYLOAD)
        body = response.json()
        assert body["subject"] == ticket.subject
        assert body["customer_email"] == ticket.customer_email
        assert body["status"] == Status.open.value
        assert body["priority"] == Priority.medium.value

    def test_rejects_unknown_fields(self):
        payload = {**self.PAYLOAD, "extra_field": "should be rejected"}
        response = client.post("/api/v1/tickets", json=payload)
        assert response.status_code == 422

    def test_rejects_missing_required_fields(self):
        response = client.post("/api/v1/tickets", json={"subject": "Only subject"})
        assert response.status_code == 422

    def test_rejects_invalid_email(self):
        payload = {**self.PAYLOAD, "customer_email": "not-an-email"}
        response = client.post("/api/v1/tickets", json=payload)
        assert response.status_code == 422

    def test_accepts_optional_category(self):
        ticket = _make_response(category="billing")
        payload = {**self.PAYLOAD, "category": "billing"}
        with patch("app.routes.tickets.ticket_service.create_ticket", return_value=ticket):
            response = client.post("/api/v1/tickets", json=payload)
        assert response.status_code == 201
        assert response.json()["category"] == "billing"

    def test_accepts_explicit_priority(self):
        ticket = _make_response(priority=Priority.high)
        payload = {**self.PAYLOAD, "priority": "high"}
        with patch("app.routes.tickets.ticket_service.create_ticket", return_value=ticket):
            response = client.post("/api/v1/tickets", json=payload)
        assert response.json()["priority"] == "high"

    def test_rejects_invalid_priority(self):
        payload = {**self.PAYLOAD, "priority": "urgent"}
        response = client.post("/api/v1/tickets", json=payload)
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/v1/tickets
# ---------------------------------------------------------------------------

class TestListTickets:
    def test_returns_200(self):
        with patch("app.routes.tickets.ticket_service.get_tickets", return_value=([], 0)):
            response = client.get("/api/v1/tickets")
        assert response.status_code == 200

    def test_response_shape(self):
        tickets = [_make_response(), _make_response()]
        with patch("app.routes.tickets.ticket_service.get_tickets", return_value=(tickets, 2)):
            response = client.get("/api/v1/tickets")
        body = response.json()
        assert body["total"] == 2
        assert body["skip"] == 0
        assert body["limit"] == 20
        assert len(body["items"]) == 2

    def test_empty_list(self):
        with patch("app.routes.tickets.ticket_service.get_tickets", return_value=([], 0)):
            response = client.get("/api/v1/tickets")
        body = response.json()
        assert body["items"] == []
        assert body["total"] == 0

    def test_forwards_skip_and_limit(self):
        with patch("app.routes.tickets.ticket_service.get_tickets", return_value=([], 0)) as mock_svc:
            client.get("/api/v1/tickets?skip=10&limit=5")
        mock_svc.assert_called_once()
        _, skip, limit = mock_svc.call_args[0]
        assert skip == 10
        assert limit == 5

    def test_rejects_negative_skip(self):
        response = client.get("/api/v1/tickets?skip=-1")
        assert response.status_code == 422

    def test_rejects_zero_limit(self):
        response = client.get("/api/v1/tickets?limit=0")
        assert response.status_code == 422

    def test_rejects_limit_over_100(self):
        response = client.get("/api/v1/tickets?limit=101")
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/v1/tickets/{ticket_id}
# ---------------------------------------------------------------------------

class TestGetTicket:
    def test_returns_200_when_found(self):
        ticket = _make_response()
        with patch("app.routes.tickets.ticket_service.get_ticket_by_id", return_value=ticket):
            response = client.get(f"/api/v1/tickets/{ticket.id}")
        assert response.status_code == 200

    def test_response_body_matches_ticket(self):
        ticket = _make_response(subject="Found it")
        with patch("app.routes.tickets.ticket_service.get_ticket_by_id", return_value=ticket):
            response = client.get(f"/api/v1/tickets/{ticket.id}")
        assert response.json()["subject"] == "Found it"
        assert response.json()["id"] == str(ticket.id)

    def test_returns_404_when_not_found(self):
        missing_id = uuid4()
        with patch(
            "app.routes.tickets.ticket_service.get_ticket_by_id",
            side_effect=TicketNotFound(missing_id),
        ):
            response = client.get(f"/api/v1/tickets/{missing_id}")
        assert response.status_code == 404

    def test_404_body_contains_detail(self):
        missing_id = uuid4()
        with patch(
            "app.routes.tickets.ticket_service.get_ticket_by_id",
            side_effect=TicketNotFound(missing_id),
        ):
            response = client.get(f"/api/v1/tickets/{missing_id}")
        assert response.json()["detail"] == "Ticket not found"

    def test_rejects_non_uuid_id(self):
        response = client.get("/api/v1/tickets/not-a-uuid")
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# PATCH /api/v1/tickets/{ticket_id}
# ---------------------------------------------------------------------------

class TestUpdateTicket:
    def test_returns_200_on_success(self):
        ticket = _make_response(subject="Updated")
        with (
            patch("app.routes.tickets.ticket_service.get_ticket_by_id", return_value=ticket),
            patch("app.routes.tickets.ticket_service.update_ticket", return_value=ticket),
        ):
            response = client.patch(f"/api/v1/tickets/{ticket.id}", json={"subject": "Updated"})
        assert response.status_code == 200

    def test_response_body_reflects_update(self):
        ticket = _make_response(subject="Updated subject")
        with (
            patch("app.routes.tickets.ticket_service.get_ticket_by_id", return_value=ticket),
            patch("app.routes.tickets.ticket_service.update_ticket", return_value=ticket),
        ):
            response = client.patch(f"/api/v1/tickets/{ticket.id}", json={"subject": "Updated subject"})
        assert response.json()["subject"] == "Updated subject"

    def test_returns_404_when_ticket_not_found(self):
        missing_id = uuid4()
        with patch(
            "app.routes.tickets.ticket_service.get_ticket_by_id",
            side_effect=TicketNotFound(missing_id),
        ):
            response = client.patch(f"/api/v1/tickets/{missing_id}", json={"status": "resolved"})
        assert response.status_code == 404

    def test_rejects_empty_patch_body(self):
        ticket_id = uuid4()
        response = client.patch(f"/api/v1/tickets/{ticket_id}", json={})
        assert response.status_code == 422

    def test_rejects_unknown_fields(self):
        ticket_id = uuid4()
        response = client.patch(f"/api/v1/tickets/{ticket_id}", json={"unknown": "field"})
        assert response.status_code == 422

    def test_can_update_status(self):
        ticket = _make_response(status=Status.resolved)
        with (
            patch("app.routes.tickets.ticket_service.get_ticket_by_id", return_value=ticket),
            patch("app.routes.tickets.ticket_service.update_ticket", return_value=ticket),
        ):
            response = client.patch(f"/api/v1/tickets/{ticket.id}", json={"status": "resolved"})
        assert response.json()["status"] == "resolved"

    def test_rejects_null_subject(self):
        ticket_id = uuid4()
        response = client.patch(f"/api/v1/tickets/{ticket_id}", json={"subject": None})
        assert response.status_code == 422
