"""
Main budget web app (backend)
Written by Fela Maslen, 2016
"""

from flask import Flask, request, render_template

from srv.config import PIE_TOLERANCE
from srv.misc import get_serial
from srv.rest_api import WebAPI

APP = Flask('budget')

@APP.route('/api', methods=['GET', 'POST'])
def api():
    """ api entry point """
    the_api = WebAPI(request)

    if the_api.res['api_error']:
        return "Unknown server error", 500

    return the_api.get_json(), the_api.res['code']

@APP.route('/')
@APP.route('/index.html')
def index():
    """ web app entry point """
    dev = 'dev' in request.args
    serial = get_serial()

    return render_template('index.html', dev=dev, serial=serial, \
            pie_tolerance=PIE_TOLERANCE)

if __name__ == '__main__':
    APP.run(host='0.0.0.0', port=8000)

