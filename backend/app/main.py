from fastapi import FastAPI

app = FastAPI(
    title="Support Intelligence Platform",
    description="AI-powered customer support platform",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}
