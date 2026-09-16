import asyncio
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

waiting_users = []
rooms = {}
lock = asyncio.Lock()


async def send_json(websocket, data):
    try:
        await websocket.send_json(data)
        return True
    except Exception:
        return False


async def match_users():
    async with lock:
        while len(waiting_users) >= 2:
            user1 = waiting_users.pop(0)
            user2 = waiting_users.pop(0)

            room_id = str(uuid.uuid4())

            rooms[room_id] = {
                "users": {
                    user1["id"]: user1["websocket"],
                    user2["id"]: user2["websocket"],
                }
            }

            await send_json(
                user1["websocket"],
                {
                    "type": "matched",
                    "room_id": room_id,
                    "user_id": user1["id"],
                    "partner_id": user2["id"],
                }
            )

            await send_json(
                user2["websocket"],
                {
                    "type": "matched",
                    "room_id": room_id,
                    "user_id": user2["id"],
                    "partner_id": user1["id"],
                }
            )


def remove_from_waiting(user_id):
    global waiting_users

    waiting_users = [
        user
        for user in waiting_users
        if user["id"] != user_id
    ]


def find_room(user_id):
    for room_id, room in rooms.items():
        if user_id in room["users"]:
            return room_id, room

    return None, None


async def remove_user(user_id, websocket):
    async with lock:
        remove_from_waiting(user_id)

        room_id, room = find_room(user_id)

        if room_id is None:
            return

        room["users"].pop(user_id, None)

        for other_id, other_websocket in room["users"].items():
            await send_json(
                other_websocket,
                {
                    "type": "partner_left",
                    "message": "Your chat partner left."
                }
            )

        if not room["users"]:
            rooms.pop(room_id, None)


@router.websocket("/ws/random")
async def random_chat(websocket: WebSocket):

    await websocket.accept()

    # Server-generated anonymous ID
    user_id = str(uuid.uuid4())

    try:

        async with lock:
            waiting_users.append({
                "id": user_id,
                "websocket": websocket
            })

        # Tell frontend its own server-side ID
        await send_json(
            websocket,
            {
                "type": "waiting",
                "user_id": user_id,
                "message": "Looking for someone to chat with..."
            }
        )

        await match_users()

        while True:

            data = await websocket.receive_json()

            message_type = data.get("type")

            # =========================
            # NORMAL MESSAGE
            # =========================

            if message_type == "message":

                content = data.get("content", "").strip()

                if not content:
                    continue

                room_id, room = find_room(user_id)

                if room_id is None:
                    continue

                message = {
                    "type": "message",
                    "sender_id": user_id,
                    "content": content
                }

                # Send to everyone in this room
                for other_id, other_websocket in room["users"].items():

                    await send_json(
                        other_websocket,
                        message
                    )

            # =========================
            # SKIP
            # =========================

            elif message_type == "skip":

                async with lock:

                    room_id, room = find_room(user_id)

                    if room_id is None:
                        continue

                    partner_ids = [
                        uid
                        for uid in room["users"]
                        if uid != user_id
                    ]

                    for partner_id in partner_ids:

                        partner_socket = room["users"][partner_id]

                        await send_json(
                            partner_socket,
                            {
                                "type": "partner_skipped",
                                "message": "Your chat partner skipped."
                            }
                        )

                        room["users"].pop(partner_id, None)

                    room["users"].pop(user_id, None)

                    rooms.pop(room_id, None)

                    # Put current user back into waiting queue
                    waiting_users.append({
                        "id": user_id,
                        "websocket": websocket
                    })

                await send_json(
                    websocket,
                    {
                        "type": "waiting",
                        "user_id": user_id,
                        "message": "Looking for a new person..."
                    }
                )

                await match_users()

            # =========================
            # LEAVE
            # =========================

            elif message_type == "leave":
                break

    except WebSocketDisconnect:
        pass

    except Exception as error:
        print(
            "RANDOM CHAT ERROR:",
            repr(error)
        )

    finally:
        await remove_user(
            user_id,
            websocket
        )