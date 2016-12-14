"""
Main class for serving data to the clients
"""

import json
from collections import deque

from srv.db import Database
from srv.user import User

from srv.config import IP_BAN_TIME
from srv.api_data import AddDelete, Retrieve, Update

class CommandAPI(object):
    """ api wrapper for the cli interface """
    def __init__(self, uid, method, task, args, form):
        self.error = False

        self.res = {} # response data

        """ new database connection """
        self.dbx = Database()

        task = deque(task)

        if self.error is not False:
            self.error = True
            self.error_text = "Must supply a valid command"

        else:
            # self.validate_args() creates self.method and self.task

            # initialise api object to process the actual request
            api = API(self.dbx)

            # give internal server error if execute() returns False
            self.api_error = api.execute(uid, method, task, args, form) is False

            self.error = api.error
            self.error_text = api.error_text
            self.extra = api.extra
            self.data = api.data

    def process_response(self):
        """ gets a response from the output data """
        if self.extra is not None and len(self.extra) > 0:
            for key in self.extra:
                self.res[key] = self.extra[key]

        if len(self.data) > 0:
            self.res['data'] = self.data

        self.res['error'] = self.error

        if len(self.error_text) > 0:
            self.res['errorText'] = self.error_text

    def print_output(self):
        """ for the cli app (formatted response) """
        self.process_response()

        print self.res

class WebAPI(object):
    """ api wrapper for the web app, to handle requests """
    def __init__(self, request):
        # new database connection
        self.dbx = Database()

        # headers
        header_forward = request.headers.getlist("X-Forwarded-For")
        header_auth = request.headers.getlist("Authorization")

        self.headers = {
            'auth': header_auth[0] if header_auth else None,
            'remote_ip': header_forward[0] if header_forward \
                else request.remote_addr
        }

        # form stuff
        self.form = {
            # parameters
            'form': request.form,
            'args': request.args,

            # method: GET or POST
            'method': request.method,
        }

        # response stuff
        self.res = {
            'data': {}, # this is the main response provided
            'extra': {}, # for legacy reasons this is required
            'res': {}, # this is the entire response given

            'error': False,
            'errorText': "",

            'api_error': False,
            'code': 200
        }

        pin = self.form['form']['pin'] if 'pin' in self.form['form'] else None

        # user object for login and authentication
        self.user = User(self.dbx, pin)

        if self.validate_args() is False:
            self.res['error'] = True
            self.res['errorText'] = "Must supply a task!"

            return

        # logins aren't handled by the API class
        if self.form['task'][0] == 'login':
            self.res['api_error'] = self.task_login()

        else:
            # make sure we're authenticated before proceeding
            auth_status = self.user.auth(self.headers['auth'])

            if auth_status > 0:
                # not authenticated
                self.error = True
                self.error_text = "Not authenticated" if auth_status == 2 \
                        else "Bad authentication token"

                self.res['api_error'] = True

            elif auth_status is not None:
                # initialise api object to process the actual request
                api = API(self.dbx)

                # give internal server error if execute() returns False
                self.res['api_error'] = api.execute(
                    self.user.uid, self.form['method'], self.form['task'], \
                    self.form['args'], self.form['form']
                ) is False

                self.res['error'] = api.error
                self.res['errorText'] = api.error_text
                self.res['extra'] = api.extra
                self.res['data'] = api.data

        # close the database connection
        self.dbx.close()

    def process_response(self):
        """ gets a response from the output data """
        if self.res['extra'] is not None and len(self.res['extra']) > 0:
            for key in self.res['extra']:
                self.res['res'][key] = self.res['extra'][key]

        if len(self.res['data']) > 0:
            self.res['res']['data'] = self.res['data']

        self.res['res']['error'] = self.res['error']

        if len(self.res['errorText']) > 0:
            self.res['res']['errorText'] = self.res['errorText']

    def get_json(self):
        """ for the web app (json) """
        self.process_response()

        return json.dumps(self.res['res'], separators=(',', ':'))

    def validate_args(self):
        """
        sets the task list

        returns boolean on whether or not the arguments
        were passed correctly
        """

        task = self.form['args'].get('t')

        if task is None:
            return False

        self.form['task'] = deque(task.split('/'))

        return True

    def task_login(self):
        """ log in, responding with an authentication token """
        login_status = self.user.login(self.headers['remote_ip'])

        if login_status is None: # unknown error occurred
            return False

        if login_status is False: # ip banned
            self.res['code'] = 401
            self.res['error'] = True
            self.res['errorText'] = \
                    "Your IP has been banned for %s seconds" % IP_BAN_TIME

        elif self.user.uid > 0:
            # correct login
            self.res['res']['uid'] = self.user.uid
            self.res['res']['name'] = self.user.name
            self.res['res']['api_key'] = self.user.api_key

        else:
            # bad login
            self.res['error'] = True
            self.res['errorText'] = "No PIN" \
                    if self.user.pin is None else "Bad PIN"

class API(object):
    """ class to process a request and potentially read or modify data """
    def __init__(self, dbx):
        self.dbx = dbx

        self.error = False
        self.error_text = None
        self.data = None
        self.extra = None

    def get_response(self, uid, method, task, args, form):
        """ decides what to do based on the task set """
        arg = task.popleft()

        data = None

        if method == 'GET':
            if arg == 'pie':
                task.appendleft(arg)
                arg = 'data'

            if arg == 'data':
                data = Retrieve(self.dbx, uid, task, args)

        elif method == 'POST':
            if arg == 'update':
                data = Update(self.dbx, uid, task, args, form)

            elif arg == 'add' or arg == 'delete':
                data = AddDelete(arg, self.dbx, uid, task, args, form)

        default_response = {
            'error': True, 'errorText': "Invalid task", 'data': {}
        }

        response = default_response if data is None else data.get_response()

        if response is None: # server error
            return False

        return response

    def execute(self, uid, method, task, args, form):
        """ returns false iff a server (not user) error was encountered """
        response = self.get_response(uid, method, task, args, form)

        self.extra = response['extra']
        self.data = response['data']
        self.error = response['error']
        self.error_text = response['errorText']

        return True

