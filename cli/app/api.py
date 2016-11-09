"""
Reads and writes data on the server, through the budget API
"""

import requests

from const import API_URL

class BudgetClientAPI(object):
    def __init__(self):
        pass

    def req_get(self, task, query = {}):
        """ makes a get (retrieve) request to the api """
        query['t'] = '/'.join(task)

        res = requests.get(API_URL, params = query)

        if res.status_code != 200:
            return False

        return res.json()

