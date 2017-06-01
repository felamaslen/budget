"""
Class for handling user login / logout
"""

import time
from hashlib import sha1

from app.config import IP_BAN_TIME, IP_BAN_TRIES

class User(object):
    """ handles user login """
    def __init__(self, db, pin=None):
        self.dbx = db

        self.uid = 0
        self.name = None
        self.api_key = None

        self.ip_check = {
            'exists': False,
            'count': 0,
            'expired': False
        }

        no_pin = pin is None or len(pin) == 0

        if not no_pin:
            try:
                pin = int(pin)
            except ValueError:
                pin = 0

        self.pin = str(pin) if not no_pin else None

    def ip_check_before(self, ip_addr):
        """
        implements throttling to prevent brute force login attempts
        (thanks to Webster for the idea)
        returns true iff ip is banned
        """
        # penalty to give if IP breaches brute force limit
        num_seconds_penalty = IP_BAN_TIME
        # number of consecutive bad login attempts to allow
        num_tries = IP_BAN_TRIES

        ip_check_query = self.dbx.query("""
        SELECT `time`, `count` FROM ip_login_req WHERE `ip` = %s
        """, [ip_addr])

        if ip_check_query is False:
            return None

        self.ip_check['exists'] = False
        self.ip_check['count'] = 0
        self.ip_check['expired'] = False

        for row in ip_check_query:
            self.ip_check['exists'] = True

            last_time = int(row[0])
            self.ip_check['count'] = int(row[1])

        if self.ip_check['exists']:
            current_time = int(time.time())
            since = current_time - last_time

            if since < num_seconds_penalty:
                # ip has done an unsuccessful login attempt in the past
                # penalty period
                if self.ip_check['count'] >= num_tries:
                    # ip has exceeded the fat finger allowance, so needs
                    # locking out for a penalty period
                    return True

            else:
                # we are beyond the penalty period, so forget about
                # all previous bad login attempts from ip
                self.ip_check['count'] = 0
                self.ip_check['expired'] = True

        return False

    def ip_check_after(self, ip_addr):
        """ increments the bad login counter if a bad login is attempted """
        if self.uid == 0:
            # bad login attempted; increment or insert counter
            current_time = int(time.time())

            if self.ip_check['exists']:
                self.dbx.query("""
                UPDATE ip_login_req SET `time` = %s, `count` = %s WHERE ip = %s
                """, [current_time, self.ip_check['count'] + 1, ip_addr])
            else:
                self.dbx.query("""
                INSERT INTO ip_login_req (`ip`, `time`, `count`) VALUES (%s, %s, %s)
                """, [ip_addr, current_time, 1])

        elif self.ip_check['expired']:
            # ip made a good login after waiting for ban time to expire
            # delete counter
            self.dbx.query("""
            DELETE FROM ip_login_req WHERE `ip` = %s
            """, [ip_addr])

    def login(self, ip_addr):
        """ try to log in """
        breached_penalty = self.ip_check_before(ip_addr)

        if breached_penalty is None: # unknown error
            return None

        if breached_penalty is True: # ip is temp banned
            return False

        if breached_penalty is False and self.pin is not None:
            info = self.dbx.query("""
            SELECT uid, user, api_key FROM users WHERE api_key = %s
            """, [self.password_hash()])

            if info is False:
                return False

            for row in info:
                self.uid = int(row[0])
                self.name = str(row[1])
                self.api_key = str(row[2])

        self.ip_check_after(ip_addr)

        return True # login attempted

    def auth(self, token):
        """ authenticates using an authorization http header """
        if token is None or len(token) == 0:
            return 2

        query = self.dbx.query("""
        SELECT uid, user FROM users WHERE api_key = %s
        """, [token])

        if query is False:
            return None

        for (uid, user) in query:
            self.uid = int(uid)
            self.name = str(user)

        return 1 if self.uid == 0 else 0

    def password_hash(self):
        """
        gets the has of a password (4 digit pin)
        """
        return sha1(self.pin).hexdigest()
