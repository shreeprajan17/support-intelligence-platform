from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.models.ticket import Priority, Status


class TicketCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    subject: Annotated[str, Field(min_length=1, max_length=200)]
    description: Annotated[str, Field(min_length=1)]
    customer_email: EmailStr
    category: Annotated[str | None, Field(default=None, max_length=100)] = None
    priority: Priority = Priority.medium


class TicketUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    subject: Annotated[str, Field(min_length=1, max_length=200)] | None = None
    description: Annotated[str, Field(min_length=1)] | None = None
    customer_email: EmailStr | None = None
    category: Annotated[str | None, Field(max_length=100)] = None
    priority: Priority | None = None
    status: Status | None = None

    @model_validator(mode="after")
    def validate_update(self) -> TicketUpdate:
        if not self.model_fields_set:
            raise ValueError("Update request must contain at least one field")

        non_nullable = {"subject", "description", "customer_email", "priority", "status"}
        for field in non_nullable & self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"'{field}' cannot be set to null")

        return self


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject: str
    description: str
    customer_email: str
    category: str | None
    priority: Priority
    status: Status
    created_at: datetime
    updated_at: datetime


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    total: int
    skip: int
    limit: int
