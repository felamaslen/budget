#!/usr/bin/python3

"""
ncurses client for budget app
"""

import curses

from app.main import BudgetClient

APP = BudgetClient()
curses.wrapper(APP.start)

