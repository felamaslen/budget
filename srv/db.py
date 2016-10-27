"""
Class for handling database
"""

import mysql.connector

import db_info

db_conn = mysql.connector.connect(
    user        = db_info.DB_USERNAME,
    password    = db_info.DB_PASSWORD,
    database    = 'budget',
    host        = db_info.DB_HOSTNAME,
    port        = db_info.DB_PORT
)

cursor = db_conn.cursor()

def query(statement, data = None):
    cursor.execute(statement, data)

    return cursor

def last_insert_id():
    return cursor.lastrowid
