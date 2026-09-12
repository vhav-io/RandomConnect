import sqlite3


DATABASE = "randomconnect.db"


def get_connection():

    connection = sqlite3.connect(DATABASE)

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():

    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute("""
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE
        )
    """)


    connection.commit()

    connection.close()

def execute_query(query, parameters=()):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        query,
        parameters
    )

    connection.commit()

    connection.close()
def fetch_one(query, parameters=()):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        query,
        parameters
    )

    result = cursor.fetchone()

    connection.close()

    return result