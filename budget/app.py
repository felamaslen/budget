"""
Main budget app (backend)
Written by Fela Maslen, 2016
"""

from flask import Flask
from flask import Response

budget = Flask('budget')

@budget.route('/hello')
def hello_world():
    return Response(
        "Hello world from Flask!\n",
        mimetype = 'text/plain'
    )

app = budget.wsgi_app
