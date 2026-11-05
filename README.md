# Support Intelligence Platform

An AI-powered customer support platform built as a progressive engineering learning project.

The goal is to build real infrastructure incrementally, understanding every architectural decision along the way — from a modular monolith through microservices, Docker, Kafka, Kubernetes, and agentic LLM systems.

## Current architecture

**Modular monolith** — a single deployable unit with internal module boundaries that make future service extraction straightforward.

| Layer | Technology |
|---|---|
| API | FastAPI (Python 3.12) |
| Database | PostgreSQL (via Docker) |
| ORM | SQLAlchemy |
| Frontend | React (not yet set up) |

## Repository structure

```
backend/
  app/
    routes/    # HTTP endpoint definitions
    models/    # SQLAlchemy ORM models
    schemas/   # Pydantic request/response shapes
    services/  # Business logic
  tests/
  requirements.txt
  Dockerfile
frontend/        # React app (future milestone)
infrastructure/  # Docker Compose, Kubernetes manifests (future milestones)
docs/
  architecture/  # Architectural Decision Records
  experiments/   # Spike notes and experiment results
```

## Development setup

### Prerequisites

- Python 3.12
- Docker Desktop

### Run the backend locally

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
.venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Copy the environment template and fill in values
cp ../.env.example ../.env

# Start the API server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### Run the backend in Docker

```bash
cd backend
docker build -t support-intelligence-backend .
docker run -p 8000:8000 support-intelligence-backend
```

## Milestones

- [x] Milestone 1 — Initial project scaffolding
- [ ] Milestone 2 — PostgreSQL via Docker Compose + first database model
- [ ] Milestone 3 — First API endpoints (ticket creation and retrieval)
- [ ] Milestone 4 — React frontend scaffold
- [ ] Milestone 5 — LLM integration
