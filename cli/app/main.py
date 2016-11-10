import curses
from curses.textpad import rectangle

from app.api import BudgetClientAPI
from app.user import User

from app.methods import window_color, ellipsis

from const import *

class BudgetClient(object):
    def __init__(self):

        self.pages = ["Overview", "Funds", "In", "Bills", "Food", "General",\
                "Holiday", "Social"]
        self.current_page = 0

        """ determines what will happen if navigation keys are pressed """
        self.nav_sect = NAV_SECT_TABS

        """ window definitions """
        self.w_header = None

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
        curses.init_pair(*NC_COLOR_TAB_SEL)

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

            elif c == curses.KEY_LEFT:
                self.nav(-1, 0)
            elif c == curses.KEY_UP:
                self.nav(0, -1)
            elif c == curses.KEY_RIGHT:
                self.nav(1, 0)
            elif c == curses.KEY_DOWN:
                self.nav(0, 1)

            elif c == 10: # enter
                self.nav_select()

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

        for (key, tab) in enumerate(self.pages):
            rectangle(header, 0, offset, 1, offset + len(tab) + 1)
            header.addstr(0, offset + 1, tab, \
                    curses.color_pair(NC_COLOR_TAB_SEL[0]) if \
                    key == self.current_page else color_tab)

            offset += len(tab) + 2

    def gui_header(self):
        color = curses.color_pair(NC_COLOR_HEADER[0]) | curses.A_BOLD

        if not self.w_header:
            self.w_header = window_color(0, 0, curses.COLS, 2, color)

            self.w_header.addstr(0, 0, "Budget", color)
            self.w_header.refresh()

        self.gui_tabs(self.w_header)

        self.w_header.refresh()

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

    def nav(self, dx, dy):
        """ navigates through selected part of application """
        if self.nav_sect == NAV_SECT_TABS:
            self.current_page = (self.current_page + dx) % len(self.pages)

            self.gui_header()

        elif self.nav_sect == NAV_SECT_PAGE:
            pass

    def nav_select(self):
        if self.nav_sect == NAV_SECT_TABS:
            """ load the selected tab's page """
            self.load_page(self.current_page)

    def load_page(self):
        page = self.pages[self.current_page]

        if page == "Overview":
            pass
        elif page == "Funds":
            pass
        elif page == "In":
            pass
        elif page == "Bills":
            pass
        elif page == "Food":
            pass
        elif page == "General":
            pass
        elif page == "Holiday":
            pass
        elif page == "Social":
            pass

