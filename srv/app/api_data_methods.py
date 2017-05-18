""" general api classes which are extended to perform specific functions """

class Response(object):
    """ gives an API response to the user """
    def __init__(self, db, uid, task, args):
        self.dbx = db
        self.uid = uid

        self.error = False
        self.error_text = ""
        self.data = {}

        self.task = task
        self.args = args

        self.execute()

    def get_response(self):
        """ aggregates response for json output """
        response = {}
        response['error'] = self.error
        response['errorText'] = self.error_text
        response['data'] = self.data

        response['extra'] = None

        return response

    def execute(self):
        """ does the operation """
        if len(self.task) == 0:
            self.error = True
            self.error_text = "No parameter given"

            return

class Processor(object):
    """ gets data from, or puts data into, database """
    def __init__(self, db, uid, task=None, form=None):
        self.dbx = db
        self.uid = uid

        self.error = False
        self.error_text = ""

        self.data = {}

        self.task = task
        self.form = form

        self.prepare()

    def prepare(self):
        """ overridden - should prepare request """
        pass

    def process(self):
        """ overridden - should process the request """
        pass
