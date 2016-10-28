"""
Main class for serving data to the clients
"""

import json
from collections import deque

from db import database
from user import user

from config import IP_BAN_TIME

class api:
    def __init__(self, request):
        self.api_error = False
        self.response_code = 200

        self.db = database()

        headerForward = request.headers.getlist("X-Forwarded-For")
        self.remote_ip = headerForward[0] if headerForward else request.remote_addr

        self.form = request.form
        self.args = request.args

        self.method = request.method

        try:
            pin = self.form['pin']
        except:
            pin = None

        self.user = user(self.db, pin)

        self.res = {} # this is the entire response given

        self.data = {} # this is the main response provided

        self.error = False
        self.errorText = ""

        if self.validate_args() is False:
            self.error = True
            self.errorText = "Must supply a task!"

            return

        self.api_error = self.execute() is False

        self.db.close()

    def getJSON(self):
        if len(self.data) > 0:
            self.res["data"] = self.data

        self.res["error"] = self.error

        if len(self.errorText) > 0:
            self.res["errorText"] = self.errorText

        return json.dumps(self.res, separators = (',', ':'))

    def execute(self):
        """
        decides what to do based on the task set
        """

        arg = self.task.popleft()

        if (arg == "login"):
            return self.task_login()

        else:
            self.data["foo"] = "hmm"

        return True

    def validate_args(self):
        """
        sets the task list

        returns boolean on whether or not the arguments
        were passed correctly
        """

        task = self.args.get('t')

        if (task is None):
            return False

        self.task = deque(task.split('/'))

        return True

    def task_login(self):
        login_status = self.user.login(self.remote_ip)

        if login_status is None: # unknown error occurred
            return False

        if login_status is False: # ip banned
            self.response_code = 401
            self.error = True
            self.errorText = "Your IP has been banned for %s seconds" % IP_BAN_TIME

        elif self.user.uid > 0: # correct login
            """logged in"""
            self.res["uid"]     = self.user.uid
            self.res["name"]    = self.user.name
            self.res["api_key"] = self.user.api_key

        else: # bad login
            """bad login"""
            self.error = True
            self.errorText = "No PIN" if self.user.pin is None else "Bad PIN"


class analysis:
    """ gets analysis data """

    def __init__(self):
        self.categories = ['bills', 'food', 'general', 'holiday', 'social']
        self.periods    = ['week', 'month', 'year']
        self.groupings  = ['category', 'shop']

