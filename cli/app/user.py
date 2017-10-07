"""
Handles user logins
"""

import curses
from curses.textpad import Textbox, rectangle

from app.const import LOGIN_FORM_WIDTH, LOGIN_FORM_HEIGHT, LOGIN_FORM_TITLE
from app.api import BudgetClientAPIError

class User(object):
    """ handles user object and logging in """
    def __init__(self, stdscr, logged_in, api):
        """ for ncurses """
        self.form = {'width': LOGIN_FORM_WIDTH, 'height': LOGIN_FORM_HEIGHT}
        self.state = {'uid': 0, 'name': None, 'token': None}
        self.win = {}

        self.scr = stdscr

        # callback to call when we logged in
        self.logged_in = logged_in

        self.api = api

    def display_result(self, msg):
        self.win['result'].clear()
        self.win['result'].addstr(0, 0, msg)
        self.win['result'].refresh()

    def build_login_form(self):
        self.scr.clear()

        # box around pin input
        rectangle(self.scr, 2, 1, 4, 7)
        self.scr.refresh()

        self.win['title'] = curses.newwin(1, self.form['width'], 1, 1)
        self.win['pin'] = curses.newwin(1, 5, 3, 2)
        self.win['result'] = curses.newwin(1, self.form['width'] - 8, 3, 9)

        # login form title
        self.win['title'].clear()
        self.win['title'].addstr(0, 0, LOGIN_FORM_TITLE)
        self.win['title'].refresh()

    def display_login_form(self, msg=""):
        self.display_result(msg)

        self.win['pin'].clear()
        pin_input = Textbox(self.win['pin'])
        pin_input.edit()
        self.win['pin'].refresh()

        pin = pin_input.gather().strip(' ')

        login_status = False

        try:
            pin_num = int(pin)
            login_status = self.login(pin_num)

            if login_status is True:
                self.logged_in()

            elif login_status is False:
                self.display_login_form("Bad PIN")

            else:
                self.display_login_form("Unknown error")

        except ValueError as err:
            self.display_login_form("PIN must be numeric")

    def login(self, pin):
        self.display_result("Waiting...")

        try:
            res = self.api.req(['user', 'login'], method='post', form={'pin': pin})

        except BudgetClientAPIError as code:
            self.display_result("Error: {}".format(code))
            return False

        try:
            if res['error'] is not False:
                self.display_result("Error: {}".format(res['errorText']))
                return False

            self.state['uid'] = res['uid']
            self.state['name'] = res['name']
            self.state['token'] = res['apiKey']

        except KeyError:
            return None

        return True

    def logged_out(self):
        self.state['uid'] = 0
        self.state['name'] = None
        self.state['token'] = None

        self.build_login_form()
        self.display_login_form()

