from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
import secrets
import os
import uuid

from backend.database import execute_query, fetch_one, fetch_all

router = APIRouter(
    prefix="/api/groups",
    tags=["Groups"]
)

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024

os.makedirs(UPLOAD_DIR, exist_ok=True)


class Group(BaseModel):
    name: str = Field(min_length=3, max_length=50)


class JoinGroup(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class Message(BaseModel):
    sender_id: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=5000)
    message_type: str = Field(default="text", max_length=20)


def generate_group_code():
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

    while True:
        code = "".join(secrets.choice(characters) for _ in range(6))

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
    group_code = group_code.upper()

    group = fetch_one(
        """
        SELECT *
        FROM groups
        WHERE code = %s
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

    messages = fetch_all(
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

    return messages


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

    if message.message_type not in [
        "text",
        "image",
        "video",
        "file"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid message type"
        )

    new_message = fetch_one(
        """
        INSERT INTO messages (
            group_id,
            sender_id,
            message_type,
            content
        )
        VALUES (%s, %s, %s, %s)
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
            message.message_type,
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


@router.post("/{group_code}/upload")
async def upload_file(
    group_code: str,
    file: UploadFile = File(...)
):
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

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid filename"
        )

    extension = os.path.splitext(file.filename)[1].lower()

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".mp4",
        ".webm",
        ".mov",
        ".avi",
        ".mkv",
        ".pdf",
        ".txt",
        ".zip",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx"
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="File type not supported"
        )

    safe_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )

    file_size = 0

    try:
        with open(file_path, "wb") as output_file:

            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                file_size += len(chunk)

                if file_size > MAX_FILE_SIZE:
                    output_file.close()

                    if os.path.exists(file_path):
                        os.remove(file_path)

                    raise HTTPException(
                        status_code=413,
                        detail="File is larger than 50 MB"
                    )

                output_file.write(chunk)

    except HTTPException:
        raise

    except Exception as error:
        if os.path.exists(file_path):
            os.remove(file_path)

        print("File upload error:", error)

        raise HTTPException(
            status_code=500,
            detail="File upload failed"
        )

    file_url = f"/uploads/{safe_filename}"

    execute_query(
        """
        UPDATE groups
        SET last_activity = NOW()
        WHERE id = %s
        """,
        (group["id"],)
    )

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "url": file_url,
        "size": file_size,
        "content_type": file.content_type
    }