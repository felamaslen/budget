import curses

class PageOverview(object):
    def __init__(self, win):
        self.win = win

    def switch_to(self):
        self.win.clear()
        self.win.addstr(0, 0, "Overview page (stuff goes here)")
        self.win.refresh()


