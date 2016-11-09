import curses

from app.api import BudgetClientAPI
from app.user import User

class BudgetClient(object):
    def __init__(self):
        pass

    def start(self, stdscr):
        """ this is called by the ncurses wrapper """

        api = BudgetClientAPI()

        self.user = User(stdscr, api)

        while True:
            pass

        #self.logged_in_loop()

    def logged_in_loop(self):
        """ main application loop """
        stdscr.clear()

        stdscr.addstr("Logged in as %s" % (self.user.name))

        #stdscr.addstr("%s" % api.req_get(['data', 'overview']))

        while True:
            c = stdscr.getch()

            if c == ord('q'):
                break # quit the app



