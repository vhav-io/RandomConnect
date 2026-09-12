from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

import secrets

from backend.database import (
    execute_query,
    fetch_one
)


router = APIRouter(
    prefix="/api/groups",
    tags=["Groups"]
)


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

        existing_group = fetch_one(
            "SELECT code FROM groups WHERE code = ?",
            (code,)
        )

        if existing_group is None:
            return code


# CREATE GROUP

@router.post("")
def create_group(group: Group):

    group_code = generate_group_code()

    execute_query(
        """
        INSERT INTO groups (name, code)
        VALUES (?, ?)
        """,
        (
            group.name,
            group_code
        )
    )

    return {
        "message": "Group created successfully",
        "name": group.name,
        "code": group_code
    }


# JOIN GROUP

@router.post("/join")
def join_group(group: JoinGroup):

    group_code = group.code.upper()

    existing_group = fetch_one(
        """
        SELECT *
        FROM groups
        WHERE code = ?
        """,
        (group_code,)
    )

    if existing_group is None:

        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    return {
        "message": "Successfully joined group",
        "code": existing_group["code"],
        "name": existing_group["name"]
    }


# GET GROUP

@router.get("/{group_code}")
def get_group(group_code: str):

    group_code = group_code.upper()

    group = fetch_one(
        """
        SELECT *
        FROM groups
        WHERE code = ?
        """,
        (group_code,)
    )

    if group is None:

        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    return {
        "id": group["id"],
        "code": group["code"],
        "name": group["name"]
    }