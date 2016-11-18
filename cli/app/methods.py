""" extra methods, e.g. to make curses programming less disgusting """

import numpy as np
import curses

from app.const import SYMBOL_CURRENCY

def window_color(x, y, w, h, color):
    """ returns a new window filled with a background colour """
    window = curses.newwin(h, w, y, x)
    window.clear()

    return window_fill_color(window, h, w, color)

def window_fill_color(window, h, w, color):
    spaces = min(curses.COLS - 1, w) * ' '

    for i in range(h):
        window.addstr(i, 0, spaces, color)

    return window

class YMD:
    """ date object """
    def __init__(self, ymd):
        self.year   = ymd[0]
        self.month  = ymd[1]
        self.date   = ymd[2]

    def format(self):
        return "%02d/%02d/%02d" % (self.date, self.month, self.year % 1000)

def get_item_attr(key, value):
    """ converts an item to an object, e.g. date to a date object """
    if key == 'date':
        return YMD(value)

    if key in ['cost', 'value']:
        return int(value)

    return str(value)

def format_currency(pence, width = None, align = True, show_pence = True):
    sign = '-' if pence < 0 else ''

    pounds = abs(float(pence) / 100)

    text = u"{0[0]}{0[1]}{0[2]:.2f}".format([sign, SYMBOL_CURRENCY, pounds]) \
            if show_pence else \
            u"{0[0]}{0[1]}{0[2]}".format([sign, SYMBOL_CURRENCY, int(np.round(pounds))])


    return alignr(width, text) if align else text

def alignr(width, string):
    return ' ' * (width - len(string)) + string if len(string) <= width \
            else ellipsis(string, width, '..')

def alignc(width, string):
    if len(string) <= width:
        padding = ' ' * ((width - len(string)) // 2)

        return padding + string + padding

    return ellipsis(string, width, '..')

def ellipsis(text, length, cutoff = '[...]'):
    """ shortens text with a [...] at the end """
    return text if len(text) <= length else \
            text[:length - len(text) - len(cutoff)] + cutoff

def get_tick_size(minV, maxV, numTicks = 5):
    minimum = (maxV - minV) / numTicks

    magnitude = 10 ** np.floor(np.log10(minimum))

    res = minimum / magnitude

    if res > 5:
        tick = 10 * magnitude
    elif res > 2:
        tick = 5 * magnitude
    elif res > 1:
        tick = 2 * magnitude
    else:
        tick = magnitude

    return tick

def nav_key(c):
    L = c == curses.KEY_LEFT    or c == ord('h')
    U = c == curses.KEY_UP      or c == ord('k')
    R = c == curses.KEY_RIGHT   or c == ord('l')
    D = c == curses.KEY_DOWN    or c == ord('j')

    dx = -1 if L else (1 if R else 0)
    dy = -1 if U else (1 if D else 0)

    return dx, dy, abs(dx) + abs(dy) != 0

