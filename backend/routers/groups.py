from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import secrets

from backend.database import execute_query, fetch_one, fetch_all

router = APIRouter(
    prefix="/api/groups",
    tags=["Groups"]
)


class Group(BaseModel):
    name: str = Field(min_length=3, max_length=50)


class JoinGroup(BaseModel):
    code: str = Field(min_length=4, max_length=4)


class Message(BaseModel):
    sender_id: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=5000)


def generate_group_code():
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

    while True:
        code = "".join(
            secrets.choice(characters)
            for _ in range(4)
        )

        existing_group = fetch_one(
            "SELECT code FROM groups WHERE code = %s",
            (code,)
        )

        if existing_group is None:
            return code


@router.post("")
def create_group(group: Group):
    group_code = generate_group_code()

    execute_query(
        """
        INSERT INTO groups (name, code)
        VALUES (%s, %s)
        """,
        (group.name, group_code)
    )

    return {
        "message": "Group created successfully",
        "name": group.name,
        "code": group_code
    }


@router.post("/join")
def join_group(group: JoinGroup):
    group_code = group.code.upper()

    existing_group = fetch_one(
        """
        SELECT *
        FROM groups
        WHERE code = %s
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


@router.get("/{group_code}")
def get_group(group_code: str):
    group = fetch_one(
        """
        SELECT *
        FROM groups
        WHERE code = %s
        """,
        (group_code.upper(),)
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


@router.get("/{group_code}/messages")
def get_messages(group_code: str):
    group = fetch_one(
        """
        SELECT id
        FROM groups
        WHERE code = %s
        """,
        (group_code.upper(),)
    )

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    return fetch_all(
        """
        SELECT
            id,
            sender_id,
            message_type,
            content,
            created_at
        FROM messages
        WHERE group_id = %s
        ORDER BY created_at ASC
        """,
        (group["id"],)
    )


@router.post("/{group_code}/messages")
def send_message(group_code: str, message: Message):
    group = fetch_one(
        """
        SELECT id
        FROM groups
        WHERE code = %s
        """,
        (group_code.upper(),)
    )

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    new_message = fetch_one(
        """
        INSERT INTO messages (
            group_id,
            sender_id,
            message_type,
            content
        )
        VALUES (%s, %s, 'text', %s)
        RETURNING
            id,
            sender_id,
            message_type,
            content,
            created_at
        """,
        (
            group["id"],
            message.sender_id,
            message.content
        )
    )

    execute_query(
        """
        UPDATE groups
        SET last_activity = NOW()
        WHERE id = %s
        """,
        (group["id"],)
    )

    return new_message