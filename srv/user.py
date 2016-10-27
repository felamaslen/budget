"""
Class for handling user login / logout
"""

import db
from hashlib import sha1

class user:
    def __init__(self, pin = None):
        self.uid = 0
        self.name = None

        no_pin = pin is None or len(pin) == 0

        if not no_pin:
            try:
                pin = int(pin)
            except ValueError:
                pin = 0

        self.pin = str(pin) if not no_pin else None

    def ip_check_before(self):
        """
        implements throttling to prevent brute force login attempts
        (thanks to Webster for the idea)
        """

    def ip_check_after(self):
        """
        increments the bad login counter if a bad login is attempted
        """

    def login(self):
        if self.pin is not None:
            info = db.query("""
                SELECT uid, user, api_key FROM users WHERE api_key = %s
            """, [self.password_hash()])

            row = info.fetchone()
            while row is not None:
                self.uid        = int(row[0])
                self.name       = str(row[1])
                self.api_key    = str(row[2])

                row = info.fetchone()

    def password_hash(self):
        """
        gets the has of a password (4 digit pin)
        """
        return sha1(self.pin).hexdigest()
