""" extra methods, e.g. to make curses programming less disgusting """

import curses

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

def format_currency(width, pence):
    sign = '-' if pence < 0 else ''

    return alignr(width, u"{0[0]}\xA3{0[1]:.2f}".format([sign, abs(float(pence) / 100)]))

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
