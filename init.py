from budget import wsgi
from budget import app

application = getattr(app, 'app')
httpd = wsgi.make_server(application)
