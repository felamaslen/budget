"""
Extra methods, e.g. to make curses programming less disgusting
"""

import re
import curses
from datetime import datetime
import numpy as np

from app.const import SYMBOL_CURRENCY

def window_color(pos_x, pos_y, width, height, color):
    """ returns a new window filled with a background colour """
    window = curses.newwin(height, width, pos_y, pos_x)
    window.clear()

    return window_fill_color(window, height, width, color)

def window_fill_color(window, height, width, color):
    spaces = min(curses.COLS - 1, width) * ' '

    for i in range(height):
        window.addstr(i, 0, spaces, color)

    return window

class YMD(object):
    """ date object """
    def __init__(self, ymd):
        if isinstance(ymd, list):
            self.year = ymd[0]
            self.month = ymd[1]
            self.date = ymd[2]
        else:
            self.year = ymd.year
            self.month = ymd.month
            self.date = ymd.date

    def format(self):
        return "%02d/%02d/%02d" % (self.date, self.month, self.year % 1000)

    def serialise(self):
        return [self.year, self.month, self.date]

    def serialise_input(self):
        return {'year': self.year, 'month': self.month, 'date': self.date}

def get_item_attr(key, value):
    """ converts an item to an object, e.g. date to a date object """
    if key == 'date':
        return YMD(value)

    if key in ['cost', 'value']:
        return int(value)

    return str(value)

def format_currency(pence, width=None, align=True, show_pence=True):
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

def ellipsis(text, length, cutoff='[...]'):
    """ shortens text with a [...] at the end """
    return text if len(text) <= length else \
            text[:length - len(text) - len(cutoff)] + cutoff

def get_tick_size(min_v, max_v, num_ticks=5):
    minimum = (max_v - min_v) / num_ticks

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

def nav_key(key):
    key_left = key == curses.KEY_LEFT or key == ord('h')
    key_up = key == curses.KEY_UP or key == ord('k')
    key_right = key == curses.KEY_RIGHT or key == ord('l')
    key_down = key == curses.KEY_DOWN or key == ord('j')

    d_x = -1 if key_left else (1 if key_right else 0)
    d_y = -1 if key_up else (1 if key_down else 0)

    return d_x, d_y, abs(d_x) + abs(d_y) != 0

# data functions
def date_from_input(item):
    """ gets YMD object from user input """
    if not re.match(r'[0-9]{1,2}\/[0-9]{1,2}(\/[0-9]{2,4})?', item):
        raise ValueError('Bad date')

    split = item.split('/')

    if len(split) == 2:
        year = datetime.now().year

        date, month = split

    elif len(split) == 3:
        date, month, year = split

        year = int(year)
        if year < 100:
            year += 2000

    else:
        raise ValueError('Bad date')

    return YMD([year, int(month), int(date)])

def cost_from_input(item):
    """ cost is input in pounds, but stored as pence """
    return int(float(re.sub(r'[^0-9\.]', '', item)) * 100)

def serialise(item, data_type):
    """
    user input -> REST output data
    (only basic validation since this is a client)
    """

    if data_type == 'date':
        return date_from_input(item).serialise()

    if data_type == 'cost':
        return cost_from_input(item)

    if data_type == 'units':
        return float(item)

    return str(item)

def serialise_input(item, data_type):
    """ user input -> REST input data """
    if data_type == 'date':
        return date_from_input(item).serialise_input()

    return serialise(item, data_type)

def deserialise(item, data_type, width=None):
    """ REST output data -> user output display """

    try:
        if data_type == 'date':
            return YMD(item).format()

        if data_type in ['cost', 'value']:
            align = width is not None

            return format_currency(item, width, align)

        return item if width is None else ellipsis(item, width)
    except:
        return data_type # str(item)

def display_input(item, data_type, width=None):
    """
    user input -> user output display
    essentially does nothing, except clean things up a bit
    """
    return deserialise(serialise(item, data_type), data_type, width)

