import socket
import StringIO
import sys

SERVER_ADDRESS = (HOST, PORT) = '', 8001

class WSGIServer(object):
    address_family = socket.AF_INET
    socket_type = socket.SOCK_STREAM
    request_queue_size = 1

    def __init__(self, server_address):
        # create socket
        self.listen_socket = socket.socket(
                self.address_family, self.socket_type)

        # allow to reuse the same address
        self.listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        # bind
        self.listen_socket.bind(server_address)
        # activate
        self.listen_socket.listen(self.request_queue_size)

        # get host name and port
        host, port = self.listen_socket.getsockname()[:2]
        self.server_name = socket.getfqdn(host)
        self.server_port = port

        # return headers
        self.headers_set = []

    def set_app(self, application):
        self.application = application

    def serve_forever(self):
        while True:
            # new client connection
            self.client_connection, client_address = listen_socket.accept()

            # handle one request and close the client connection.
            # then loop over to wait for another client connection
            self.handle_one_request()

    def handle_one_request(self):
        self.request_data = self.client_connection.recv(1024)

        print(''.join('< {line}\n'.format(line = line)
            for line in request_data.splitlines()
        ))

        self.parse_request(request_data)

        env = self.get_environ()

        result = self.application(env, self.start_response)

        self.finish_response(result)

    def parse_request(self, text):
        request_line = text.splintlines()[0]

        request_line = request_line.rstrip('\r\n')

        (
            self.request_method,    # e.g. GET
            self.path,              # e.g. /index
            self.request_version    # e.g. HTTP/1.1
        ) = request_line.split()

    def get_environ(self):
        env = {}

        env['wsgi.version']         = (1, 0)
        env['wsgi.url_scheme']      = 'http'
        env['wsgi.input']           = StringIO.StringIO(self.request_data)
        env['wsgi.errors']          = sys.stderr
        env['wsgi.multithread']     = False
        env['wsgi.multiprocess']    = False
        env['wsgi.run_once']        = False
        env['REQUEST_METHOD']       = self.request_method
        env['PATH_INFO']            = self.path
        env['SERVER_NAME']          = self.server_name
        env['SERVER_PORT']          = str(self.server_port)

        return env

    def start_response(self, status, response_headers, exc_info = None):
        server_headers = [
            ('Date', 'Thu, 27 Oct 2016 15:28:31 GMT'),
            ('Server', 'WSGIServer 0.2')
        ]
        self.headers_set = [status, response_headers + server_headers]

        # return self.finish_response

    def finish_response(self, result):
        try:
            status, response_headers = self.headers_set
            response = 'HTTP/1.1 {status}\r\n'.format(status = status)
            for header in response_headers:
                response += '{0}: {1}\r\n'.format(*header)

            response += '\r\n'
            for data in result:
                response += data

            print(''.join(
                '> {line}\n'.format(line = line)
                for line in response.splitlines()
            ))

            self.client_connection.sendall(response)

        finally:
            self.client_connection.close()


def make_server(server_address, application):
    server = WSGIServer(server_address)
    server.set_app(application)
    return server

if (__name__ == '__main__'):
    if (len(sys.argv) < 2):
        sys.exit('Provide a WSGI application object as module:callable')
    app_path = sys.argv[1]
    module, application = app_path.split(':')
    module = __import__(module)
    application = getattr(module, application)
    httpd = make_server(SERVER_ADDRESS, application)
    print('WSGIServer: serving HTTP on port %s...\n' % PORT)
    httpd.serve_forever()

