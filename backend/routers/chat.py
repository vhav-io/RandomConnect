from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.database import fetch_one, execute_query


router = APIRouter(
    prefix="/ws",
    tags=["Chat"]
)


class ConnectionManager:

    def __init__(self):
        self.connections = {}


    async def connect(self, group_code, websocket):

        await websocket.accept()

        if group_code not in self.connections:
            self.connections[group_code] = []

        self.connections[group_code].append(websocket)


    def disconnect(self, group_code, websocket):

        if group_code not in self.connections:
            return

        if websocket in self.connections[group_code]:
            self.connections[group_code].remove(websocket)

        if not self.connections[group_code]:
            del self.connections[group_code]


    async def broadcast(self, group_code, message):

        if group_code not in self.connections:
            return

        disconnected = []

        for websocket in self.connections[group_code]:

            try:

                await websocket.send_json(message)

            except Exception as error:

                print(
                    "Broadcast error:",
                    error
                )

                disconnected.append(websocket)


        for websocket in disconnected:

            self.disconnect(
                group_code,
                websocket
            )


manager = ConnectionManager()


@router.websocket("/groups/{group_code}")
async def group_chat(
    websocket: WebSocket,
    group_code: str
):

    group_code = group_code.upper()


    group = fetch_one(
        """
        SELECT id, name, code
        FROM groups
        WHERE code = %s
        """,
        (group_code,)
    )


    if group is None:

        await websocket.close(
            code=1008
        )

        return


    await manager.connect(
        group_code,
        websocket
    )


    try:

        # Keep the group alive when someone joins.
        execute_query(
            """
            UPDATE groups
            SET last_activity = NOW()
            WHERE id = %s
            """,
            (group["id"],)
        )


        await websocket.send_json({

            "type": "connected",

            "group": {
                "id": group["id"],
                "name": group["name"],
                "code": group["code"]
            }

        })


        while True:

            data = await websocket.receive_json()


            message_type = data.get(
                "type"
            )


            if message_type != "message":
                continue


            sender_id = data.get(
                "sender_id"
            )


            content = data.get(
                "content"
            )


            if not sender_id:
                await websocket.send_json({
                    "type": "error",
                    "message": "Missing sender ID"
                })

                continue


            if not content:
                continue


            content = content.strip()


            if not content:
                continue


            # Save message to PostgreSQL.

            message = fetch_one(
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
                    sender_id,
                    "text",
                    content
                )
            )


            # Reset the 10-minute inactivity timer.

            execute_query(
                """
                UPDATE groups
                SET last_activity = NOW()
                WHERE id = %s
                """,
                (group["id"],)
            )


            response = {

                "type": "message",

                "id": message["id"],

                "sender_id":
                    message["sender_id"],

                "message_type":
                    message["message_type"],

                "content":
                    message["content"],

                "created_at":
                    message["created_at"].isoformat()

            }


            await manager.broadcast(
                group_code,
                response
            )


    except WebSocketDisconnect:

        print(
            f"User disconnected from group {group_code}"
        )


    except Exception as error:

        print(
            "CHAT WEBSOCKET ERROR:",
            repr(error)
        )


        try:

            await websocket.send_json({

                "type": "error",

                "message":
                    "Server error while processing chat."

            })

        except Exception:
            pass


    finally:

        manager.disconnect(
            group_code,
            websocket
        )