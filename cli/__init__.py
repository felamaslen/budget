#!/usr/bin/python

"""
ncurses client for budget app
"""

import curses

from app.main import BudgetClient

app = BudgetClient()
curses.wrapper(app.start)

