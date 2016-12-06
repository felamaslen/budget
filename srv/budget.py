"""
Main budget web app (backend)
Written by Fela Maslen, 2016
"""

from flask import Flask, request, render_template
import sys

import config
import misc
import user
import rest_api

app = Flask('budget')

@app.route('/api', methods = ['GET', 'POST'])
def api():
    api = rest_api.WebAPI(request)

    if api.res['api_error']:
        return "Unknown server error", 500

    return api.get_json(), api.res['code']

@app.route('/')
def index():
    dev = 'dev' in request.args
    serial = misc.get_serial()

    return render_template(
        'index.html',
        dev = dev,
        serial = serial,
        pie_tolerance = config.PIE_TOLERANCE
    )

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 8000)
