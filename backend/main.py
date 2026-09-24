import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.random import router as random_router

from backend.database import (
    initialize_database,
    execute_query
)

from backend.routers.groups import router as groups_router
from backend.routers.chat import router as chat_router


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.on_event("startup")
async def startup():

    initialize_database()

    asyncio.create_task(
        cleanup_inactive_groups()
    )


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


async def cleanup_inactive_groups():

    while True:

        try:

            execute_query(
                """
                DELETE FROM groups
                WHERE last_activity <
                NOW() - INTERVAL '10 minutes'
                """
            )

        except Exception as error:

            print(
                "Group cleanup error:",
                error
            )

        await asyncio.sleep(60)


app.include_router(groups_router)
app.include_router(chat_router)
app.include_router(random_router)