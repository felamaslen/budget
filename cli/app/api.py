"""
Reads and writes data on the server, through the budget API
"""

import requests

from const import API_URL

class BudgetClientAPI(object):
    def __init__(self):
        pass

    def req(self, method, task, query = {}, form = None):
        """ makes a request to the api """
        query['t'] = '/'.join(task)

        if method == 'get':
            res = requests.get(API_URL, params = query)
        elif method == 'post':
            res = requests.post(API_URL, params = query, data = form)
        else:
            raise Exception

        if res.status_code != 200:
            return False

        return res.json()

