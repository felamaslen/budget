import curses
from curses.textpad import rectangle

from app.api import BudgetClientAPI
from app.user import User
from app.methods import window_color, ellipsis
from app.page_overview import PageOverview
from app.page_list import PageFunds, PageIn, PageBills, PageFood, PageGeneral, \
        PageHoliday, PageSocial
from app.const import *

class BudgetClient(object):
    def __init__(self):
        self.pages = ["Overview", "Funds", "In", "Bills", "Food", "General",\
                "Holiday", "Social"]
        self.current_page = 0

        self.page_obj = {}

        """ determines what will happen if navigation keys are pressed """
        self.nav_sect = NAV_SECT_TABS

    def define_windows(self):
        self.w_header = None

    def start(self, stdscr):
        """ this is called by the ncurses wrapper """
        self.scr = stdscr

        self.init_ncurses_colors()

        self.api = BudgetClientAPI()
        self.user = User(stdscr, self.logged_in, self.api)

        self.loop()

    def init_ncurses_colors(self):
        curses.init_pair(*NC_COLOR_BG)
        curses.init_pair(*NC_COLOR_TAB)
        curses.init_pair(*NC_COLOR_TAB_SEL)
        curses.init_pair(*NC_COLOR_UP)
        curses.init_pair(*NC_COLOR_DOWN)
        curses.init_pair(*NC_COLOR_UP_SEL)
        curses.init_pair(*NC_COLOR_DOWN_SEL)

    def loop(self):
        """ main application loop """

        if self.user.uid > 0:
            self.logged_in()
        else:
            self.user.logged_out()

        """ catch keyboard input """
        while True:
            if not self.key_input(self.scr.getch()):
                break

    def key_input(self, c):
        if c == ord(KEY_QUIT):
            return False # quit the app

        if c == ord(KEY_LOGOUT):
            self.logout()
            return True

        pass_input = True

        nav_L = c == curses.KEY_LEFT    or c == ord('h')
        nav_U = c == curses.KEY_UP      or c == ord('k')
        nav_R = c == curses.KEY_RIGHT   or c == ord('l')
        nav_D = c == curses.KEY_DOWN    or c == ord('j')

        if nav_L or nav_U or nav_R or nav_D:
            pass_input = False # this is done by the nav function itself

            if nav_L:
                self.nav(-1, 0)
            elif nav_U:
                self.nav(0, -1)
            elif nav_R:
                self.nav(1, 0)
            elif nav_D:
                self.nav(0, 1)

        elif c == KEYCODE_NEWLINE or c == KEYCODE_RETURN:
            self.nav_select()

        elif c == KEYCODE_TAB:
            self.nav_sect = (self.nav_sect + 1) % 2

            try:
                if not self.page_obj[self.pages[self.current_page]].set_nav_active(
                        self.nav_sect == NAV_SECT_PAGE):

                    self.nav_sect = NAV_SECT_TABS

            except:
                """ page isn't ready yet """
                self.nav_sect = NAV_SECT_TABS

        if pass_input:
            """ pass the input to the current page """
            try:
                self.page_obj[self.pages[self.current_page]].key_input(c)
            except:
                pass # page hasn't loaded yet

        return True

    def logged_in(self):
        self.api.set_token(self.user.token)

        self.draw_gui()

    def logout(self):
        """ show cursor """
        curses.curs_set(1)

        self.api.set_token()
        self.page_obj = {}
        self.user.logged_out()

    def draw_gui(self):
        """ calls other methods to draw the main application window """
        self.scr.clear()
        self.scr.refresh()

        """ hide cursor """
        curses.curs_set(0)

        self.define_windows()

        self.statusbar = None
        self.set_statusbar()
        self.gui_header()
        self.gui_page()

    def gui_page(self):
        color = curses.color_pair(0)

        self.w_page = curses.newwin(curses.LINES - 3, curses.COLS, 2, 0)
        self.w_page.clear()

        """ Select and load first page in list """
        self.nav(0, 0, load = True)

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

    def set_statusbar(self, items = []):
        self.statusbar = [[KEY_QUIT, "quit"], [KEY_LOGOUT, "logout"]] + items
        self.gui_statusbar()

    def gui_statusbar(self):
        """ draws a status bar at the bottom of the screen """
        color = curses.color_pair(NC_COLOR_STATUS_BAR[0])

        text1 = "Logged in as {}".format(self.user.name)

        text2 = ellipsis(" (" + ', '.join([
            "{}: {}".format(key, item)
            for (key, item) in self.statusbar
        ]) + ")", curses.COLS - len(text1))

        if not self.statusbar is None:
            del self.statusbar

        self.statusbar = window_color(0, curses.LINES - 1, curses.COLS, 1, color)
        self.statusbar.addstr(0, 0, text1, color)
        self.statusbar.addstr(0, len(text1), text2, color | curses.A_BOLD)
        self.statusbar.refresh()

    def nav(self, dx, dy, load = False):
        """ navigates through selected part of application """
        if self.nav_sect == NAV_SECT_TABS:
            self.current_page = (self.current_page + dx) % len(self.pages)

            self.gui_header()

            page = self.pages[self.current_page]

            if page in self.page_obj:
                self.page_obj[page].switch_to()
            elif load:
                self.load_page()
            else:
                self.w_page.clear()
                self.w_page.addstr(0, 0, "Press enter to load page: {}".format(page))
                self.w_page.refresh()

                self.set_statusbar()

        elif self.nav_sect == NAV_SECT_PAGE:
            try:
                self.page_obj[self.pages[self.current_page]].nav(dx, dy)
            except:
                pass # page hasn't loaded yet

    def nav_select(self):
        if self.nav_sect == NAV_SECT_TABS:
            """ load the selected tab's page """
            self.load_page()

    def load_page(self):
        page = self.pages[self.current_page]

        if not page in self.page_obj:
            self.page_obj[page] = self.get_page_obj(page)

            self.page_obj[page].switch_to()

    def get_page_obj(self, page):
        if page == "Overview":
            return PageOverview(self.w_page, self.api, self.set_statusbar)

        if page == "Funds":
            return PageFunds(self.w_page, self.api, self.set_statusbar)

        if page == "In":
            return PageIn(self.w_page, self.api, self.set_statusbar)

        if page == "Bills":
            return PageBills(self.w_page, self.api, self.set_statusbar)

        if page == "Food":
            return PageFood(self.w_page, self.api, self.set_statusbar)

        if page == "General":
            return PageGeneral(self.w_page, self.api, self.set_statusbar)

        if page == "Holiday":
            return PageHoliday(self.w_page, self.api, self.set_statusbar)

        if page == "Social":
            return PageSocial(self.w_page, self.api, self.set_statusbar)

        return None

