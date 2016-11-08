#!/usr/bin/python3

import curses

class BudgetClient(object):
    def __init__(self):
        pass

    def start(self, stdscr):
        stdscr.clear() # clear screen

        for i in range(10):
            v = i - 10
            stdscr.addstr(i, 0, '10 divided by {} is {}'.format(v, 10 / v))

        """ main application loop """
        while True:
            stdscr.refresh()
            stdscr.getkey()


app = BudgetClient()

curses.wrapper(app.start)

