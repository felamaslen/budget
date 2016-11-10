"""
Reads and writes data on the server, through the budget API
"""

import requests

from const import API_URL

class BudgetClientAPI(object):
    """ the reason this is in a class is so that the user token can be passed more easily """

    def __init__(self):
        self.session = requests.Session()

    def set_token(self, token):
        """ set authorization header for requests """
        self.session.headers.update({'Authorization': token})

    def req(self, task, method = 'get', query = {}, form = None):
        """ makes a request to the api """
        query['t'] = '/'.join(task)

        if method == 'get':
            res = self.session.get(API_URL, params = query)
        elif method == 'post':
            res = self.session.post(API_URL, params = query, data = form)
        else:
            raise Exception

        if res.status_code != 200:
            raise Exception(res.status_code)

        return res.json()

