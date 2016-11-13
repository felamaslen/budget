from app.api import BudgetClientAPIError

class Page(object):
    def __init__(self, win, api, set_statusbar = None):
        self.win = win
        self.api = api

        self.statusbar = []
        self.set_statusbar = set_statusbar

        self.nav_active = False

        self.winHW = win.getmaxyx()

        self.data = self.try_get_data()

        self.try_draw()

    def switch_to(self):
        self.win.clear()
        self.try_draw()
        self.win.refresh()

        self.set_statusbar(self.statusbar)

    def try_get_data(self):
        try:
            data = self.get_data()

            return data
        except BudgetClientAPIError as code:
            self.win.addstr(0, 0, "API error: {}".format(code))
            return None
        except:
            self.win.addstr(0, 0, "API error: unknown error!")
            return None

    def try_draw(self):
        if self.data is None:
            return

        try:
            self.draw()
        except Exception as e:
            self.win.addstr(0, 0, "Error: drawing page failed! ({})".format(e))

    def nav(self, dx, dy):
        pass

    def set_nav_active(self, status):
        self.nav_active = status
        self.nav(0, 0)

    def key_input(self, c):
        pass

