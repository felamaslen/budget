"""
Main class for serving data to the clients
"""

import json
from collections import deque

from db import database
from user import user

from config import IP_BAN_TIME

import api_data

class api:
    def __init__(self, request):
        self.api_error = False
        self.response_code = 200

        """ new database connection """
        self.db = database()

        """ headers """
        headerForward = request.headers.getlist("X-Forwarded-For")
        self.remote_ip = headerForward[0] if headerForward else request.remote_addr

        headerAuth = request.headers.getlist("Authorization")
        self.auth = headerAuth[0] if headerAuth else None

        """ parameters """
        self.form = request.form
        self.args = request.args

        """ method: GET or POST """
        self.method = request.method

        try:
            pin = self.form['pin']
        except:
            pin = None

        """ user object for login and authentication """
        self.user = user(self.db, pin)

        self.res = {} # this is the entire response given

        self.data = {} # this is the main response provided
        self.extra = {} # for legacy reasons this is required

        self.error = False
        self.errorText = ""

        if self.validate_args() is False:
            self.error = True
            self.errorText = "Must supply a task!"

            return

        """ give internal server error if execute() returns False """
        self.api_error = self.execute() is False

        """ close the database connection """
        self.db.close()

    def getJSON(self):
        if self.extra is not None and len(self.extra) > 0:
            for key in self.extra:
                self.res[key] = self.extra[key]

        if len(self.data) > 0:
            self.res['data'] = self.data

        self.res['error'] = self.error

        if len(self.errorText) > 0:
            self.res['errorText'] = self.errorText

        return json.dumps(self.res, separators = (',', ':'))

    def execute(self):
        """
        decides what to do based on the task set
        returns false iff a server (not user) error was encountered
        """

        arg = self.task.popleft()

        if (arg == 'login'):
            return self.task_login()

        else:
            """ make sure we're authenticated before proceeding """
            auth_status = self.user.auth(self.auth)

            if auth_status is None: # server error
                return False

            if auth_status > 0: # not authenticated
                self.error = True
                self.errorText = "Not authenticated" if auth_status == 2 else "Bad authentication token"

                return True

            data = None

            if self.method == 'GET':
                if arg == 'pie':
                    self.task.appendleft(arg)
                    arg = 'data'

                if arg == 'data':
                    data = api_data.retrieve(self.db, self.user.uid, self.task, self.args)

            elif self.method == 'POST':
                if arg == 'update':
                    data = api_data.update(self.db, self.user.uid, self.task, self.args, self.form)

                elif arg == 'add' or arg == 'delete':
                    data = api_data.add_delete(
                            arg, self.db, self.user.uid, self.task, self.args, self.form)

            default_response = {
                'error': True, 'errorText': "Invalid task", 'data': {}
            }

            response = default_response if data is None else data.get_response()

            if response is None: # server error
                return False

            self.extra      = response['extra']
            self.data       = response['data']
            self.error      = response['error']
            self.errorText  = response['errorText']

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


