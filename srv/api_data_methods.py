class response(object):
    def __init__(self, db, uid, task, args):
        self.db = db
        self.uid = uid

        self.error      = False
        self.errorText  = ""
        self.data       = {}

        self.serverError = False

        self.task = task
        self.args = args

        self.execute()

    def get_response(self):
        if self.serverError:
            return None

        response = {}
        response['error']       = self.error
        response['errorText']   = self.errorText
        response['data']        = self.data

        response['extra'] = None

        return response

    def execute(self):
        """ does the operation """
        if len(self.task) == 0:
            self.error = True
            self.errorText = "No parameter given"

            return

class processor(object):
    def __init__(self, db, uid):
        self.db = db
        self.uid = uid

        self.error = False
        self.errorText = ""

        self.data = {}

