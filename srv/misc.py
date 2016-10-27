"""
Miscellaneous functions
"""

import os.path
import time

import config

def file_get_contents(filename):
    if not os.path.isfile(filename):
        return None

    with open(filename) as f:
        return f.read()

def file_put_contents(filename, text):
    try:
        target = open(filename, 'w')

        target.truncate()
        target.write(text)

        return 0
    except IOError:
        return 1

def new_serial(oldSerial = None):
    date = time.strftime("%Y%m%d")

    if oldSerial is None or oldSerial[:8] is not date:
        serialIndex = 0
    else:
        serialIndex = int(oldSerial[8:]) + 1

    return date + str(serialIndex)

def get_serial():
    serial = file_get_contents(config.SERIAL_FILE)

    return new_serial() if serial is None else serial

def set_serial():
    serial = file_get_contents(config.SERIAL_FILE)

    next_serial = new_serial(serial)

    print "new serial: %s" % next_serial

    file_put_contents(config.SERIAL_FILE, next_serial)
