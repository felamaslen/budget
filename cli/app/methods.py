""" extra methods, e.g. to make curses programming less disgusting """

import numpy as np
import re
from datetime import datetime
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

""" data functions """
def date_from_input(item):
    """ gets year, month and date from user input """
    if not re.match('[0-9]{1,2}\/[0-9]{1,2}(\/[0-9]{2,4})?', item):
        raise ValueError('Bad date')

    split = item.split('/')

    if len(split) == 2:
        y = datetime.now().year

        d, m = split

    elif len(split) == 3:
        d, m, y = split

        y = int(y)
        if y < 100:
            y += 2000

    else:
        raise ValueError('Bad date')

    return y, int(m), int(d)

def cost_from_input(item):
    """ cost is input in pounds, but stored as pence """
    return int(float(re.sub('[^0-9\.]', '', item)) * 100)

def serialise(item, data_type):
    """ user input -> REST output data """

    if data_type == 'date':
        y, m, d = date_from_input(item)

        return [y, m, d]

    if data_type == 'cost':
        return cost_from_input(item)

    if data_type == 'units':
        return str(float(item)) # make sure item is numeric

    return item

def deserialise(item, data_type, width = None):
    """ REST output data -> user output display """

    if data_type == 'date':
        return YMD(item).format()

    if data_type in ['cost', 'value']:
        align = not width is None

        return format_currency(item, width, align)

    return item if width is None else ellipsis(item, width)

def serialise_input(item, data_type):
    """
    user input -> REST input data
    (only basic validation since this is a client)
    """

    if data_type == 'date':
        y, m, d = date_from_input(item)

        return ','.join([str(y), str(m), str(d)])

    return serialise(item, data_type)

def display_input(item, data_type, width = None):
    """ user input -> user output display """
    """ essentially does nothing, except clean things up a bit """

    return deserialise(serialise(item, data_type), data_type, width)

