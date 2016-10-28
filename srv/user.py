"""
Class for handling user login / logout
"""

import time
from hashlib import sha1

class user:
    def __init__(self, db, pin = None):
        self.db = db

        self.uid = 0
        self.name = None

        no_pin = pin is None or len(pin) == 0

        if not no_pin:
            try:
                pin = int(pin)
            except ValueError:
                pin = 0

        self.pin = str(pin) if not no_pin else None

    def ip_check_before(self, ip):
        """
        implements throttling to prevent brute force login attempts
        (thanks to Webster for the idea)
        """
        num_seconds_penalty = 60 # penalty to give if IP breaches brute force limit

        num_tries = 10 # number of consecutive bad login attempts to allow

        ip_check_query = self.db.query("""
        SELECT `time`, `count` FROM ip_login_req WHERE `ip` = %s
        """, [ip])

        if not ip_check_query:
            return None

        self.ip_check_exists = False
        self.ip_check_count = 0

        for row in ip_check_query:
            self.ip_check_exists = True

            last_time = int(row[0])
            self.ip_check_count = int(row[1])

        if self.ip_check_exists:
            breach = False

            current_time = int(time.time())

            if self.ip_check_count >= num_tries:
                """ ip has done at least num_tries unsuccessful login attempts """
                since = current_time - last_time

                if since < num_seconds_penalty:
                    """ ip has attempted another login in penalty time """
                    breach = True
                else:
                    """ ip has waited for penalty time to expire """
                    self.ip_check_count = 0

            if breach:
                """ give a penalty to ip """
                self.db.query("""
                UPDATE ip_login_req SET `time` = %s, `count` = %s WHERE ip = %s
                """, [current_time, num_tries, ip])

                return True

        return False

    def ip_check_after(self, ip):
        """
        increments the bad login counter if a bad login is attempted
        """
        if self.uid == 0:
            """ bad login attempted; increment or insert counter """
            current_time = int(time.time())

            if self.ip_check_exists:
                self.db.query("""
                UPDATE ip_login_req SET `time` = %s, `count` = %s WHERE ip = %s
                """, [current_time, self.ip_check_count + 1, ip])
            else:
                self.db.query("""
                INSERT INTO ip_login_req (`ip`, `time`, `count`) VALUES (%s, %s, %s)
                """, [ip, current_time, 1])

    def login(self, ip):
        breachedPenalty = self.ip_check_before(ip)

        if breachedPenalty is None:
            return False

        if breachedPenalty is True:
            return False

        if breachedPenalty is False and self.pin is not None:
            info = self.db.query("""
            SELECT uid, user, api_key FROM users WHERE api_key = %s
            """, [self.password_hash()])

            if info is False:
                return False

            for row in info:
                self.uid        = int(row[0])
                self.name       = str(row[1])
                self.api_key    = str(row[2])

        self.ip_check_after(ip)

        return True

    def password_hash(self):
        """
        gets the has of a password (4 digit pin)
        """
        return sha1(self.pin).hexdigest()
