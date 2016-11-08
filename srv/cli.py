"""
CLI interface to budget app (backend)
Written by Fela Maslen, 2016
"""

import sys
import urlparse

import rest_api

sysargs = sys.argv[1:]

try:
    method, uid, task, args, form = sysargs
except ValueError:
    form = None
    try:
        method, uid, task, args = sysargs
    except ValueError:
        args = None
        try:
            method, uid, task = sysargs
        except ValueError:
            print("Not enough arguments given")
            sys.exit()

try:
    method = str(method)

    uid = int(uid)

    task = str(task).split('/')

    args = {} if args is None else urlparse.parse_qs(args)

    form = {} if form is None else urlparse.parse_qs(form)

except:
    print("Bad arguments")
    sys.exit()

api = rest_api.CommandAPI(uid, method, task, args, form)
api.print_output()

