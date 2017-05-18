#!./env/bin/python

"""
CLI interface to budget app (backend)
Written by Fela Maslen, 2016
"""

import sys
import urlparse

from app.rest_api import CommandAPI

def main():
    """ main cli app entry point """
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
                print "Not enough arguments given"
                sys.exit()

    try:
        method = str(method)

        uid = int(uid)
        task = str(task).split('/')

        args = {} if args is None else urlparse.parse_qs(args)
        form = {} if form is None else urlparse.parse_qs(form)

    except ValueError:
        print "Bad arguments"
        sys.exit()

    api = CommandAPI(uid, method, task, args, form)
    api.print_output()

main()

