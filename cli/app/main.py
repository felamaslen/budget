"""
Main CLI app, called by init script
"""
import curses
from curses.textpad import rectangle

from app.api import BudgetClientAPI
from app.user import User
from app.methods import window_color, ellipsis, nav_key
from app.page_overview import PageOverview
from app.page_list import PageFunds, PageIncome, PageBills, PageFood, PageGeneral, \
        PageHoliday, PageSocial
from app.const import NC_COLOR_BG, NC_COLOR_TAB, NC_COLOR_TAB_SEL, NC_COLOR_UP, \
        NC_COLOR_DOWN, NC_COLOR_UP_SEL, NC_COLOR_DOWN_SEL, \
        NC_COLOR_HEADER, NC_COLOR_STATUS_BAR, \
        KEY_QUIT, KEY_LOGOUT, KEYCODE_NEWLINE, KEYCODE_RETURN, KEYCODE_TAB, \
        NAV_SECT_TABS, NAV_SECT_PAGE

def init_ncurses_colors():
    curses.init_pair(*NC_COLOR_BG)
    curses.init_pair(*NC_COLOR_TAB)
    curses.init_pair(*NC_COLOR_TAB_SEL)
    curses.init_pair(*NC_COLOR_UP)
    curses.init_pair(*NC_COLOR_DOWN)
    curses.init_pair(*NC_COLOR_UP_SEL)
    curses.init_pair(*NC_COLOR_DOWN_SEL)

class BudgetClient(object):
    """ main app """
    def __init__(self):
        self.state = {
            'pages': ["Overview", "Funds", "Income", "Bills", "Food", "General", \
                "Holiday", "Social"],
            'obj': {},
            'current': 0,
            'statusbar': []
        }

        # determines what will happen if navigation keys are pressed
        self.nav_sect = NAV_SECT_TABS

        # define windows
        self.win = {'statusbar': None, 'header': None}

        self.scr = None
        self.api = None
        self.user = None

    def start(self, stdscr):
        """ this is called by the ncurses wrapper """
        self.scr = stdscr

        init_ncurses_colors()

        self.api = BudgetClientAPI()
        self.user = User(stdscr, self.logged_in, self.api)

        self.loop()

    def loop(self):
        """ main application loop """

        if self.user.state['uid'] > 0:
            self.logged_in()
        else:
            self.user.logged_out()

        # catch keyboard input
        while True:
            if not self.key_input(self.scr.getch()):
                break

    def key_input(self, char):
        if char == ord(KEY_QUIT):
            return False # quit the app

        if char == ord(KEY_LOGOUT):
            self.logout()
            return True

        pass_input = True

        d_x, d_y, done_nav = nav_key(char)

        if done_nav:
            pass_input = False # this is done by the nav function itself
            self.nav(d_x, d_y)

        elif char == KEYCODE_NEWLINE or char == KEYCODE_RETURN:
            self.nav_select()

        can_nav = True

        if pass_input:
            # pass the input to the current page
            try:
                can_nav = self.state['obj'][self.state['pages'][self.state['current']]]\
                        .key_input(char)
            except AttributeError:
                pass # page hasn't loaded yet

        if can_nav and char == KEYCODE_TAB:
            self.nav_sect = (self.nav_sect + 1) % 2

            try:
                if not self.state['obj'][self.state['pages'][self.state['current']]].set_nav_active(
                        self.nav_sect == NAV_SECT_PAGE):

                    self.nav_sect = NAV_SECT_TABS

            except AttributeError:
                # page isn't read_y yet
                self.nav_sect = NAV_SECT_TABS


        return True

    def logged_in(self):
        self.api.set_token(self.user.state['token'])

        self.draw_gui()

    def logout(self):
        """ show cursor """
        curses.curs_set(1)

        self.api.set_token()
        self.state['obj'] = {}
        self.user.logged_out()

    def draw_gui(self):
        """ calls other methods to draw the main application window """
        self.scr.clear()
        self.scr.refresh()

        # hide cursor
        curses.curs_set(0)

        self.set_statusbar()
        self.gui_header()
        self.gui_page()

    def gui_page(self):
        self.win['page'] = curses.newwin(curses.LINES - 3, curses.COLS, 2, 0)
        self.win['page'].clear()

        # Select and load first page in list
        self.nav(0, 0, load=True)

    def gui_tabs(self, header):
        color_tab = curses.color_pair(NC_COLOR_TAB[0])

        offset = 7 # length of "Budget" title + 1

        for (key, tab) in enumerate(self.state['pages']):
            rectangle(header, 0, offset, 1, offset + len(tab) + 1)
            header.addstr(0, offset + 1, tab, \
                    curses.color_pair(NC_COLOR_TAB_SEL[0]) if \
                    key == self.state['current'] else color_tab)

            offset += len(tab) + 2

    def gui_header(self):
        color = curses.color_pair(NC_COLOR_HEADER[0]) | curses.A_BOLD

        if not self.win['header']:
            self.win['header'] = window_color(0, 0, curses.COLS, 2, color)

            self.win['header'].addstr(0, 0, "Budget", color)
            self.win['header'].refresh()

        self.gui_tabs(self.win['header'])

        self.win['header'].refresh()

    def set_statusbar(self, items=None):
        self.state['statusbar'] = [[KEY_QUIT, "quit"], [KEY_LOGOUT, "logout"]] + \
                ([] if items is None else items)
        self.gui_statusbar()

    def gui_statusbar(self):
        """ draws a status bar at the bottom of the screen """
        color = curses.color_pair(NC_COLOR_STATUS_BAR[0])

        text1 = "Logged in as {}".format(self.user.state['name'])

        text2 = ellipsis(" (" + ', '.join([
            "{}: {}".format(key, item)
            for (key, item) in self.state['statusbar']
        ]) + ")", curses.COLS - len(text1))

        if self.win['statusbar'] is not None:
            del self.win['statusbar']

        self.win['statusbar'] = window_color(0, curses.LINES - 1, curses.COLS, 1, color)
        self.win['statusbar'].addstr(0, 0, text1, color)
        self.win['statusbar'].addstr(0, len(text1), text2, color | curses.A_BOLD)
        self.win['statusbar'].refresh()

    def nav(self, d_x, d_y, load=False):
        """ navigates through selected part of application """
        if self.nav_sect == NAV_SECT_TABS:
            self.state['current'] = (self.state['current'] + d_x) % len(self.state['pages'])

            self.gui_header()

            page = self.state['pages'][self.state['current']]

            if page in self.state['obj']:
                self.state['obj'][page].switch_to()
            elif load:
                self.load_page()
            else:
                self.win['page'].clear()
                self.win['page'].addstr(0, 0, "Press enter to load page: {}".format(page))
                self.win['page'].refresh()

                self.set_statusbar()

        elif self.nav_sect == NAV_SECT_PAGE:
            try:
                self.state['obj'][self.state['pages'][self.state['current']]].nav(d_x, d_y)
            except AttributeError:
                pass # page hasn't loaded yet

    def nav_select(self):
        if self.nav_sect == NAV_SECT_TABS:
            # load the selected tab's page
            self.load_page()

    def load_page(self):
        page = self.state['pages'][self.state['current']]

        if page not in self.state['obj']:
            if page == "Overview":
                self.state['obj'][page] = PageOverview(\
                        self.win['page'], self.api, self.set_statusbar)

            elif page == "Funds":
                self.state['obj'][page] = PageFunds(self.win['page'], self.api, self.set_statusbar)

            elif page == "Income":
                self.state['obj'][page] = PageIncome(self.win['page'], self.api, self.set_statusbar)

            elif page == "Bills":
                self.state['obj'][page] = PageBills(self.win['page'], self.api, self.set_statusbar)

            elif page == "Food":
                self.state['obj'][page] = PageFood(self.win['page'], self.api, self.set_statusbar)

            elif page == "General":
                self.state['obj'][page] = PageGeneral(\
                        self.win['page'], self.api, self.set_statusbar)

            elif page == "Holiday":
                self.state['obj'][page] = PageHoliday(\
                        self.win['page'], self.api, self.set_statusbar)

            elif page == "Social":
                self.state['obj'][page] = PageSocial(self.win['page'], self.api, self.set_statusbar)

            self.state['obj'][page].switch_to()


