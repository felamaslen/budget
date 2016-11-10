""" extra methods, e.g. to make curses programming less disgusting """

import curses

def window_color(x, y, w, h, color):
    """ returns a new window filled with a background colour """
    window = curses.newwin(h, w, y, x)
    window.clear()

    spaces = min(curses.COLS - 1, w) * ' '

    for i in range(h):
        window.addstr(i, 0, spaces, color)

    return window

def ellipsis(text, length):
    """ shortens text with a [...] at the end """
    return text if len(text) <= length else text[:5] + "[...]"

def format_currency(pence):
    return u"\xA3{0:.2f}".format(float(pence) / 100)


