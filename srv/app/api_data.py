"""
Operates on (retrieve, add, edit, delete) data in the database
Does not handle authentication
"""

from app.config import LIST_CATEGORIES
from app.data_get import \
        Overview, ListAll, ListData, \
        Funds, FundHistory,\
        Pie, Search, Stocks
from app.data_get_analysis import Analysis, AnalysisCategory
from app.data_post import \
        UpdateOverview, UpdateListData, \
        AddListData, DeleteListData

from app.api_data_methods import Response

class Retrieve(Response):
    """ retrieves data from the database """
    def __init__(self, db, uid, task, args):
        super(Retrieve, self).__init__(db, uid, task, args)

    def get_processor(self, arg):
        """ gets the correct processor based on the passed argument """
        proc = None

        if arg == 'analysis':
            proc = Analysis(self.dbx, self.uid, self.task)

        elif arg == 'analysis_category':
            proc = AnalysisCategory(self.dbx, self.uid, self.task)

        elif arg == 'all':
            proc = ListAll(self.dbx, self.uid)

        elif arg == 'overview':
            proc = Overview(self.dbx, self.uid)

        elif arg in ('funds', 'fund_history'):
            period = self.args['period'] if 'period' in self.args else None
            history = {'period': period}

            if arg == 'funds':
                history_arg = history if 'history' in self.args else False

                proc = Funds(self.dbx, self.uid, history_arg)

            else:
                proc = FundHistory(self.dbx, self.uid, history)

        elif arg in LIST_CATEGORIES:
            offset = self.task.popleft() if len(self.task) > 0 else 0

            if offset is None:
                offset = 0

            offset = int(offset)

            if offset < 0:
                offset = 0

            proc = ListData(self.dbx, self.uid, arg, offset)

        elif arg == 'pie':
            proc = Pie(self.dbx, self.uid, self.task)

        elif arg == 'search':
            proc = Search(self.dbx, self.uid, self.task)

        elif arg == 'stocks':
            proc = Stocks(self.dbx, self.uid)

        return proc

    def execute(self):
        super(Retrieve, self).execute()

        arg = self.task.popleft()

        # decide which processor to run
        this_processor = self.get_processor(arg)

        # decide whether the processor is valid
        if this_processor is None:
            result = None
        elif this_processor.error:
            result = this_processor
        else:
            result = this_processor.process()

        if result is not None:
            self.error = True if result is False else this_processor.error
            self.error_text = this_processor.error_text
            self.data = this_processor.data

        else:
            self.error = True
            self.error_text = "Unknown task"

class Update(Response):
    """ updates data in the database """
    def __init__(self, db, uid, task, args, form):
        self.form = form
        self.new_total = None

        super(Update, self).__init__(db, uid, task, args)

    def get_response(self):
        response = super(Update, self).get_response()

        if self.new_total is not None and response is not None:
            # add new total to response after updating
            response['extra'] = {'total': self.new_total}

        return response

    def execute(self):
        super(Update, self).execute()

        this_processor = None

        self.new_total = None
        get_total = False

        if len(self.task) > 0:
            arg = self.task.popleft()

            if arg == 'overview':
                this_processor = UpdateOverview(self.dbx, self.uid, self.form)

            else:
                get_total = True
                this_processor = UpdateListData(self.dbx, self.uid, \
                        arg, self.form)

        # decide whether the processor is valid
        if this_processor is None:
            result = None
        elif this_processor.error:
            result = this_processor
        else:
            result = this_processor.process()

        if result is not None:
            self.error = True if result is False else this_processor.error
            self.error_text = this_processor.error_text
            self.data = this_processor.data

            if get_total:
                self.new_total = this_processor.new_total

        else:
            self.error = True
            self.error_text = "Unknown task"

class AddDelete(Response):
    """ adds or deletes data to / from the database """
    def __init__(self, which, db, uid, task, args, form):
        self.form = form
        self.which = which
        self.add_id = None
        self.new_total = None

        super(AddDelete, self).__init__(db, uid, task, args)

    def get_response(self):
        response = super(AddDelete, self).get_response()

        if self.error is False and response is not None:
            # add id and new total to response after adding item
            response['extra'] = {'total': self.new_total}

            if self.which == 'add':
                response['extra']['id'] = self.add_id

        return response

    def execute(self):
        """ run the process() method of the processor """
        super(AddDelete, self).execute()

        table = None if len(self.task) == 0 else self.task.popleft()

        if table is None:
            self.error = True
            self.error_text = "Must provide a table"

        self.new_total = None
        self.add_id = None

        this_processor = None

        if self.which == 'add':
            this_processor = AddListData(self.dbx, self.uid, table, self.form)
        elif self.which == 'delete':
            this_processor = DeleteListData(self.dbx, self.uid, \
                    table, self.form)

        if this_processor is None:
            self.error = True
            self.error_text = "Unknown server error"

            return

        result = this_processor if this_processor.error \
                else this_processor.process()

        self.error = True if result is False else this_processor.error
        self.error_text = this_processor.error_text

        if self.error is False:
            self.new_total = this_processor.new_total

            if self.which == 'add':
                self.add_id = this_processor.add_id

