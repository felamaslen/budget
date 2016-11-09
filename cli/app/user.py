from time import sleep

import curses
from curses.textpad import Textbox, rectangle

class User:
    """ handles user object and logging in """
    def __init__(self, stdscr, api):
        """ for ncurses """
        self.scr = stdscr

        self.uid = 0
        self.name = None

        self.token = None
        self.pin = None

        self.result_length = 20

        self.build_login_form()
        self.display_login_form()

    def display_result(self, msg):
        self.win_result.clear()
        self.win_result.box()
        self.win_result.addstr(1, 1, msg)
        self.win_result.refresh()

    def build_login_form(self):
        self.scr.clear()

        self.win_title  = curses.newwin(1, 40, 0, 0)
        self.win_pin    = curses.newwin(1, 5, 2, 1)
        self.win_result = curses.newwin(3, self.result_length + 2, 4, 0)

        self.win_title.addstr(0, 0, "Enter your PIN to log in: ")

        """ box around pin input """
        rectangle(self.scr, 1, 0, 3, 6)

        self.scr.refresh()

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
                return
            else:
                self.display_login_form("Bad PIN")

        except ValueError:
            self.display_login_form("PIN must be numeric")

    def login(self, pin):
        return True if str(pin) == "1996" else False

        pass

