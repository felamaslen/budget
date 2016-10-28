"""
Main class for serving data to the clients
"""

import json
from collections import deque

from user import user

class api:
    def __init__(self, db, request):
        self.api_error = False

        self.remote_ip = request.headers.getlist("X-Forwarded-For")[0] if request.headers.getlist("X-Forwarded-For") else request.remote_addr

        self.form = request.form
        self.args = request.args

        self.method = request.method

        try:
            pin = self.form['pin']
        except:
            pin = None

        self.user = user(db, pin)

        self.res = {} # this is the entire response given

        self.data = {} # this is the main response provided

        self.error = False
        self.errorText = ""

        if self.validate_args() is False:
            self.error = True
            self.errorText = "Must supply a task!"

            return

        self.api_error = not self.execute()

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
            login_status = self.user.login(self.remote_ip)

            if not login_status: # unknown error occurred
                return False

            if self.user.uid > 0:
                """logged in"""
                self.res["uid"]     = self.user.uid
                self.res["name"]    = self.user.name
                self.res["api_key"] = self.user.api_key
            else:
                """bad login"""
                self.error = True
                self.errorText = "No PIN" if self.user.pin is None else "Bad PIN"

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


class analysis:
    """ gets analysis data """

    def __init__(self):
        self.categories = ['bills', 'food', 'general', 'holiday', 'social']
        self.periods    = ['week', 'month', 'year']
        self.groupings  = ['category', 'shop']

