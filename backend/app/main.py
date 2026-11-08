from fastapi import FastAPI

from app.routes import health, tickets

app = FastAPI(
    title="Support Intelligence Platform",
    description="AI-powered customer support platform",
    version="0.1.0",
)

app.include_router(health.router)
app.include_router(tickets.router)
