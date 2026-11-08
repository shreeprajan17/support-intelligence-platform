import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.ticket import TicketCreate, TicketListResponse, TicketResponse, TicketUpdate
from app.services import ticket as ticket_service
from app.services.ticket import TicketNotFound

router = APIRouter(prefix="/api/v1/tickets", tags=["tickets"])


@router.post("", response_model=TicketResponse, status_code=201)
def create_ticket(ticket_data: TicketCreate, db: Session = Depends(get_db)):
    return ticket_service.create_ticket(db, ticket_data)


@router.get("", response_model=TicketListResponse)
def list_tickets(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    tickets, total = ticket_service.get_tickets(db, skip, limit)
    return TicketListResponse(items=tickets, total=total, skip=skip, limit=limit)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        return ticket_service.get_ticket_by_id(db, ticket_id)
    except TicketNotFound:
        raise HTTPException(status_code=404, detail="Ticket not found")


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: uuid.UUID,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
):
    try:
        ticket = ticket_service.get_ticket_by_id(db, ticket_id)
        return ticket_service.update_ticket(db, ticket, ticket_data)
    except TicketNotFound:
        raise HTTPException(status_code=404, detail="Ticket not found")


@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        ticket = ticket_service.get_ticket_by_id(db, ticket_id)
        ticket_service.delete_ticket(db, ticket)
        return Response(status_code=204)
    except TicketNotFound:
        raise HTTPException(status_code=404, detail="Ticket not found")
