"""
CLI interface to budget app (backend)
Written by Fela Maslen, 2016
"""

import rest_api

command = None # TODO: parse cli arguments

api = rest_api.CommandAPI(command)

api.print_output()

