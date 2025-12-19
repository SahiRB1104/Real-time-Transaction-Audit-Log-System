from fastapi import FastAPI
from .database import engine
from . import models

app = FastAPI(title="Transaction & Audit Log System")

# Create DB tables
models.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "Backend running successfully"}
