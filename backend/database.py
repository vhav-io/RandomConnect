import os
import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row
    )


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
            sender_id TEXT NOT NULL,
            message_type TEXT NOT NULL DEFAULT 'text',
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    connection.commit()
    connection.close()


def execute_query(query, parameters=()):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(query, parameters)

    connection.commit()
    connection.close()


def fetch_one(query, parameters=()):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(query, parameters)

    result = cursor.fetchone()

    connection.close()

    return result


def fetch_all(query, parameters=()):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(query, parameters)

    result = cursor.fetchall()

    connection.close()

    return result