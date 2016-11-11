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

def format_currency(width, pence):
    sign = '-' if pence < 0 else ''

    return alignr(width, u"{0[0]}\xA3{0[1]:.2f}".format([sign, abs(float(pence) / 100)]))

def alignr(width, string):
    return ' ' * (width - len(string)) + string if len(string) <= width \
            else string[:2] + ".."

