"""
Class for handling database
"""

import mysql.connector

from srv.db_info import DB_USERNAME, DB_PASSWORD, DB_HOSTNAME, DB_PORT

class Database(object):
    """ handles database connections """
    def __init__(self):
        self.conn = mysql.connector.connect(user=DB_USERNAME, \
                password=DB_PASSWORD, database='budget', \
                host=DB_HOSTNAME, port=DB_PORT)

        self.cursor = self.conn.cursor()

        self.needs_commit = False

    def close(self):
        """ closes the database connection """
        if self.needs_commit:
            self.conn.commit()

        self.cursor.close()
        self.conn.close()

    def query(self, statement, data=None):
        """ executes a query """
        statement = statement.strip()

        try:
            self.cursor.execute(statement, data)
        except AttributeError as error:
            print "[DBFAIL] %s" % error

            return False

        if statement.startswith("UPDATE") or statement.startswith("INSERT") or \
                statement.startswith("DELETE"):
            self.needs_commit = True

            return True

        results = list(self.cursor)
        return results

    def last_insert_id(self):
        """ gets the last auto incremented id from an insert """
        return self.cursor.lastrowid

