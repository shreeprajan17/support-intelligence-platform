import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
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


def get_tickets(db: Session, skip: int, limit: int) -> tuple[list[Ticket], int]:
    total = db.scalar(select(func.count()).select_from(Ticket)) or 0
    tickets = list(
        db.scalars(
            select(Ticket)
            .order_by(Ticket.created_at.desc(), Ticket.id)
            .offset(skip)
            .limit(limit)
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
