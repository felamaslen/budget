"""
Main budget app (backend)
Written by Fela Maslen, 2016
"""

from flask import Flask
#from flask import Response

app = Flask('budget')

@app.route('/')
def hello():
    return "Hello World!"
    #return Response(
    #    "Hello world from Flask!\n",
    #    mimetype = 'text/plain'
    #)

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 8002)
