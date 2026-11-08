import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.ticket import Priority, Status, Ticket
from app.schemas.ticket import TicketCreate, TicketUpdate


class TicketNotFound(Exception):
    pass


def create_ticket(db: Session, ticket_data: TicketCreate) -> Ticket:
    ticket = Ticket(**ticket_data.model_dump())
    db.add(ticket)
    try:
        db.commit()
        db.refresh(ticket)
    except Exception:
        db.rollback()
        raise
    return ticket


def get_tickets(
    db: Session,
    skip: int,
    limit: int,
    search: str | None = None,
    status: Status | None = None,
    priority: Priority | None = None,
    category: str | None = None,
    sort_by: str = "created_at_desc",
) -> tuple[list[Ticket], int]:
    conditions = []

    if search:
        term = f"%{search}%"
        conditions.append(
            or_(
                Ticket.subject.ilike(term),
                Ticket.description.ilike(term),
                Ticket.customer_email.ilike(term),
            )
        )

    if status is not None:
        conditions.append(Ticket.status == status)

    if priority is not None:
        conditions.append(Ticket.priority == priority)

    if category is not None:
        conditions.append(Ticket.category.ilike(f"%{category}%"))

    base = select(Ticket)
    if conditions:
        base = base.where(*conditions)

    count_q = select(func.count(Ticket.id))
    if conditions:
        count_q = count_q.where(*conditions)
    total = db.scalar(count_q) or 0

    if sort_by == "created_at_asc":
        order = Ticket.created_at.asc()
    elif sort_by == "priority_desc":
        order = Ticket.priority.desc()
    elif sort_by == "priority_asc":
        order = Ticket.priority.asc()
    else:
        order = Ticket.created_at.desc()

    tickets = list(
        db.scalars(
            base.order_by(order, Ticket.id).offset(skip).limit(limit)
        ).all()
    )
    return tickets, total


def get_ticket_by_id(db: Session, ticket_id: uuid.UUID) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise TicketNotFound(ticket_id)
    return ticket


def update_ticket(db: Session, ticket: Ticket, ticket_data: TicketUpdate) -> Ticket:
    for field, value in ticket_data.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    try:
        db.commit()
        db.refresh(ticket)
    except Exception:
        db.rollback()
        raise
    return ticket


def delete_ticket(db: Session, ticket: Ticket) -> None:
    try:
        db.delete(ticket)
        db.commit()
    except Exception:
        db.rollback()
        raise
