from time import sleep

import curses
from curses.textpad import Textbox, rectangle

from const import *

class User:
    """ handles user object and logging in """
    def __init__(self, stdscr, api, logged_in):
        """ for ncurses """
        self.form_width = LOGIN_FORM_WIDTH
        self.form_height = LOGIN_FORM_HEIGHT

        self.scr = stdscr
        self.api = api

        self.uid = 0
        self.name = None
        self.token = None

        """ callback to call when we logged in """
        self.logged_in = logged_in

    def display_result(self, msg):
        self.win_result.clear()
        self.win_result.addstr(0, 0, msg)
        self.win_result.refresh()

    def build_login_form(self):
        self.scr.clear()

        """ box around pin input """
        rectangle(self.scr, 2, 1, 4, 7)
        self.scr.refresh()

        self.win_title  = curses.newwin(1, self.form_width, 1, 1)
        self.win_pin    = curses.newwin(1, 5, 3, 2)
        self.win_result = curses.newwin(1, self.form_width - 8, 3, 9)

        """ login form title """
        self.win_title.clear()
        self.win_title.addstr(0, 0, LOGIN_FORM_TITLE)
        self.win_title.refresh()

    def display_login_form(self, msg = ""):
        self.display_result(msg)

        self.win_pin.clear()
        pin_input = Textbox(self.win_pin)
        pin_input.edit()
        self.win_pin.refresh()

        pin = pin_input.gather().strip(' ')

        login_status = False

        try:
            pin = int(pin)

            login_status = self.login(int(pin))

            if login_status is True:
                """ logged in """
                self.logged_in()
            else:
                self.display_login_form("Bad PIN")

        except ValueError:
            self.display_login_form("PIN must be numeric")

    def login(self, pin):
        self.display_result("Waiting...")

        res = self.api.req('post', ['login'], form = {'pin': pin})

        if res is False or not res['error'] is False:
            return False

        self.uid    = res['uid']
        self.name   = res['name']
        self.token  = res['api_key']

        return True

    def logged_out(self):
        self.uid = 0
        self.name = None
        self.token = None

        self.build_login_form()
        self.display_login_form()
