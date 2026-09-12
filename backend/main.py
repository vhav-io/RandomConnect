from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import secrets


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TEMPORARY DATA STORAGE
groups = {}

# PYDANTIC MODELS

class Group(BaseModel):
    name: str = Field(
        min_length=3,
        max_length=50
    )


class JoinGroup(BaseModel):
    code: str = Field(
        min_length=6,
        max_length=6
    )

# HELPER FUNCTIONS
def generate_group_code():

    while True:

        code = secrets.token_hex(3).upper()

        if code not in groups:
            return code

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


# GROUP ROUTES

@app.post("/api/groups")
def create_group(group: Group):

    group_code = generate_group_code()


    groups[group_code] = {
        "name": group.name
    }


    return {
        "message": "Group created successfully",
        "name": group.name,
        "code": group_code
    }
@app.post("/api/groups/join")
def join_group(group: JoinGroup):

    group_code = group.code.upper()


    if group_code not in groups:

        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )


    return {
        "message": "Successfully joined group",
        "code": group_code,
        "name": groups[group_code]["name"]
    }

# GET GROUP

@app.get("/api/groups/{group_code}")
def get_group(group_code: str):

    group_code = group_code.upper()


    if group_code not in groups:

        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )


    return {
        "code": group_code,
        "name": groups[group_code]["name"]
    }