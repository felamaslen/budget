import curses

from app.api import BudgetClientAPI
from app.user import User

class BudgetClient(object):
    def __init__(self):
        pass

    def start(self, stdscr):
        """ this is called by the ncurses wrapper """
        self.scr = stdscr

        api = BudgetClientAPI()

        self.user = User(stdscr, api)

        self.logged_in_loop()

    def logged_in_loop(self):
        """ main application loop """
        self.scr.clear()

        self.scr.addstr("Logged in as %s" % (self.user.name))
        self.scr.refresh()

        #self.scr.addstr("%s" % api.req_get(['data', 'overview']))

        while True:
            c = self.scr.getch()

            if c == ord('q'):
                break # quit the app



