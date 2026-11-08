
"""
Generate 100 realistic sample support tickets.

Run from the backend directory:
    python -m scripts.seed_tickets

The script uses deterministic UUIDs, so running it again
will not insert duplicate sample tickets.
"""

import random
import uuid
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.models.ticket import Ticket


TOTAL_TICKETS = 100

# A fixed namespace makes generated IDs reproducible.
NAMESPACE = uuid.UUID("12345678-1234-5678-1234-567812345678")

random.seed(42)

CUSTOMERS = [
    "alex.morgan@example.com",
    "sophia.chen@example.com",
    "james.wilson@example.com",
    "olivia.patel@example.com",
    "ethan.brown@example.com",
    "emma.johnson@example.com",
    "liam.davis@example.com",
    "ava.thomas@example.com",
    "noah.garcia@example.com",
    "mia.robinson@example.com",
    "lucas.martin@example.com",
    "isabella.lee@example.com",
    "mason.clark@example.com",
    "amelia.walker@example.com",
    "logan.hall@example.com",
    "charlotte.allen@example.com",
]

TICKETS = [
    (
        "Unable to complete payment",
        "I attempted to complete a payment, but the transaction failed even though the amount appears to have been deducted from my account.",
        "Billing",
    ),
    (
        "Unexpected subscription charge",
        "I noticed an unexpected charge on my latest invoice. Could you please investigate and explain the additional amount?",
        "Billing",
    ),
    (
        "Refund request for cancelled order",
        "I cancelled my order several days ago but have not received my refund. Please check the refund status.",
        "Billing",
    ),
    (
        "Cannot reset my password",
        "I have requested multiple password reset emails but none of them have arrived in my inbox.",
        "Account",
    ),
    (
        "Account temporarily locked",
        "My account was unexpectedly locked after several login attempts. I need assistance restoring access.",
        "Account",
    ),
    (
        "Unable to update profile information",
        "The application does not save changes when I attempt to update my account profile.",
        "Account",
    ),
    (
        "Application crashes during startup",
        "The application closes unexpectedly immediately after launching. I have already tried restarting my device.",
        "Technical",
    ),
    (
        "Dashboard loading very slowly",
        "The dashboard takes a long time to load, especially when viewing reports with a large amount of data.",
        "Technical",
    ),
    (
        "File upload keeps failing",
        "I receive an error whenever I try to upload documents. The same files worked correctly last week.",
        "Technical",
    ),
    (
        "Request for additional features",
        "It would be helpful to have an option to export reports directly as PDF files. Please consider adding this feature.",
        "Feature Request",
    ),
    (
        "Need help understanding the product",
        "I am new to the platform and would appreciate some guidance on configuring the main dashboard.",
        "General Inquiry",
    ),
    (
        "Notification emails not received",
        "I am no longer receiving email notifications for important account activities and updates.",
        "Technical",
    ),
    (
        "Order status has not changed",
        "My order has been showing the same status for several days. Could you check whether it is still being processed?",
        "General Inquiry",
    ),
    (
        "Duplicate transaction detected",
        "I noticed two transactions for what should have been a single purchase. Please investigate the duplicate charge.",
        "Billing",
    ),
    (
        "Unable to access premium features",
        "My subscription is active, but premium features are still unavailable when I log into the application.",
        "Account",
    ),
]

PRIORITIES = ["low", "medium", "high", "critical"]

PRIORITY_WEIGHTS = [15, 40, 35, 10]

STATUSES = ["open", "in_progress", "resolved", "closed"]

STATUS_WEIGHTS = [20, 25, 35, 20]


def generate_ticket(index: int) -> dict:
    subject, description, category = random.choice(TICKETS)

    created_at = datetime.now(timezone.utc) - timedelta(
        days=random.randint(0, 90),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )

    updated_at = created_at + timedelta(
        seconds=random.randint(
            0,
            int((datetime.now(timezone.utc) - created_at).total_seconds()),
        )
    )

    # Give each record a reproducible UUID.
    ticket_id = uuid.uuid5(NAMESPACE, f"sample-ticket-{index}")

    return {
        "id": ticket_id,
        "subject": subject,
        "description": description,
        "customer_email": random.choice(CUSTOMERS),
        "category": category,
        "priority": random.choices(
            PRIORITIES,
            weights=PRIORITY_WEIGHTS,
            k=1,
        )[0],
        "status": random.choices(
            STATUSES,
            weights=STATUS_WEIGHTS,
            k=1,
        )[0],
        "created_at": created_at,
        "updated_at": updated_at,
    }


def seed_tickets():
    db = SessionLocal()

    try:
        existing_ids = {
            row[0]
            for row in db.query(Ticket.id).all()
        }

        new_tickets = []

        for index in range(1, TOTAL_TICKETS + 1):
            data = generate_ticket(index)

            if data["id"] in existing_ids:
                continue

            new_tickets.append(Ticket(**data))

        if not new_tickets:
            print("All 100 sample tickets already exist.")
            return

        db.add_all(new_tickets)
        db.commit()

        print(f"Successfully inserted {len(new_tickets)} tickets.")
        print(f"Skipped {TOTAL_TICKETS - len(new_tickets)} existing tickets.")

    except Exception:
        db.rollback()
        print("Import failed. Database transaction rolled back.")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_tickets()
