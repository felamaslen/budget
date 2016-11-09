import curses
from curses.textpad import rectangle

from app.api import BudgetClientAPI
from app.user import User

from app.methods import window_color, ellipsis

from const import *

class BudgetClient(object):
    def __init__(self):
        pass

    def start(self, stdscr):
        """ this is called by the ncurses wrapper """
        self.scr = stdscr

        self.init_ncurses_colors()

        self.api = api = BudgetClientAPI()

        self.user = User(stdscr, api, self.draw_gui)

        self.loop()

    def init_ncurses_colors(self):
        curses.init_pair(*NC_COLOR_BG)
        curses.init_pair(*NC_COLOR_TAB)

    def loop(self):
        """ main application loop """

        if self.user.uid > 0:
            self.draw_gui()
        else:
            self.user.logged_out()

        """ catch keyboard input """
        while True:
            c = self.scr.getch()

            if c == ord(KEY_QUIT):
                break # quit the app

            elif c == ord(KEY_LOGOUT):
                self.logout()

    def logout(self):
        self.user.logged_out()

    def draw_gui(self):
        """ calls other methods to draw the main application window """
        self.scr.clear()
        self.scr.refresh()

        self.gui_statusbar()
        self.gui_header()

    def gui_tabs(self, header):
        color_tab = curses.color_pair(NC_COLOR_TAB[0])

        offset = 7 # length of "Budget" title + 1

        tab1_title = "Overview"
        rectangle(header, 0, offset, 1, offset + len(tab1_title) + 1)
        header.addstr(1, offset + 1, tab1_title, color_tab)

    def gui_header(self):
        color = curses.color_pair(NC_COLOR_HEADER[0]) | curses.A_BOLD

        header = window_color(0, 0, curses.COLS, 2, color)
        header.addstr(0, 0, "Budget", color)
        header.refresh()

        self.gui_tabs(header)

        header.refresh()

    def gui_statusbar(self):
        """ draws a status bar at the bottom of the screen """
        color = curses.color_pair(NC_COLOR_STATUS_BAR[0])

        text1 = "Logged in as {}".format(self.user.name)
        text2 = ellipsis(" ({}: quit, {}: logout)".format(KEY_QUIT, KEY_LOGOUT), \
            curses.COLS - len(text1))

        statusbar = window_color(0, curses.LINES - 1, curses.COLS, 1, color)
        statusbar.addstr(0, 0, text1, color)
        statusbar.addstr(0, len(text1), text2, color | curses.A_BOLD)
        statusbar.refresh()


