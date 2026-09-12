from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import initialize_database
from backend.routers.groups import router as groups_router


# APP

app = FastAPI()


# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# STARTUP

@app.on_event("startup")
def startup():

    initialize_database()


# BASIC ROUTES

@app.get("/")
def home():

    return {
        "message": "RandomConnect backend is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


@app.get("/api/status")
def get_status():

    return {
        "application": "RandomConnect",
        "backend": "running",
        "message": "Frontend can communicate with FastAPI"
    }


# ROUTERS

app.include_router(groups_router)