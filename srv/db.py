"""
Class for handling database
"""

import mysql.connector

import db_info

class database:
    def __init__(self):
        self.conn = mysql.connector.connect(
            user        = db_info.DB_USERNAME,
            password    = db_info.DB_PASSWORD,
            database    = 'budget',
            host        = db_info.DB_HOSTNAME,
            port        = db_info.DB_PORT
        )

        self.cursor = self.conn.cursor()

        self.needs_commit = False

    def close(self):
        if self.needs_commit:
            self.conn.commit()

        self.cursor.close()
        self.conn.close()


    def query(self, statement, data = None):
        statement = statement.strip()

        try:
            self.cursor.execute(statement, data)
        except AttributeError as error:
            print "[DBFAIL] %s" % error

            return False

        if statement.startswith("UPDATE") or statement.startswith("INSERT"):
            self.needs_commit = True

            return True

        results = list(self.cursor)
        return results

    def last_insert_id(self):
        return self.cursor.lastrowid
