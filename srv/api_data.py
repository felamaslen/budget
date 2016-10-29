"""
Operates on (retrieve, add, edit, delete) data in the database
Does not handle authentication
"""

import time
from datetime import datetime, timedelta

from config import LIST_CATEGORIES

from data_get import overview, list_all, list_data, funds, fund_history,\
        pie, search, stocks, analysis, analysis_category
from data_post import update_overview, update_list_data, add_list_data, delete_list_data

from api_data_methods import response

class retrieve(response):
    """ retrieves data from the database """
    def __init__(self, db, uid, task, args):
        super(retrieve, self).__init__(db, uid, task, args)

    def execute(self):
        super(retrieve, self).execute()

        this_processor = None

        arg = self.task.popleft()

        """ decide which processor to run """
        if arg == 'analysis':
            this_processor = analysis(self.db, self.uid, self.task)
        elif arg == 'analysis_category':
            this_processor = analysis_category(self.db, self.uid, self.task)

        elif arg == 'all':
            this_processor = list_all(self.db, self.uid)

        elif arg == 'overview':
            this_processor = overview(self.db, self.uid)

        elif arg == 'funds':
            this_processor = funds(self.db, self.uid)

        elif arg in LIST_CATEGORIES:
            offset = self.task.popleft() if len(self.task) > 0 else 0

            if offset is None:
                offset = 0

            offset = int(offset)

            if offset < 0:
                offset = 0

            this_processor = list_data(self.db, self.uid, arg, offset)

        elif arg == 'fund_history':
            deep = 'deep' in self.args
            this_processor = fund_history(self.db, self.uid, deep)

        elif arg == 'pie':
            this_processor = pie(self.db, self.uid, self.task)

        elif arg == 'search':
            this_processor = search(self.db, self.uid, self.task)

        elif arg == 'stocks':
            this_processor = stocks(self.db, self.uid)

        """ decide whether the processor is valid """
        if this_processor is None:
            result = None
        elif this_processor.error:
            result = this_processor
        else:
            result = this_processor.process()

        if result is not None:
            self.error      = True if result is False else this_processor.error
            self.errorText  = this_processor.errorText
            self.data       = this_processor.data

        else:
            self.error      = True
            self.errorText  = "Unknown task"

class update(response):
    """ updates data in the database """
    def __init__(self, db, uid, task, args, form):
        self.form = form

        super(update, self).__init__(db, uid, task, args)

    def get_response(self):
        response = super(update, self).get_response()

        if self.new_total is not None and response is not None:
            """ add new total to response after updating """
            response['extra'] = { 'total': self.new_total }

        return response

    def execute(self):
        super(update, self).execute()

        this_processor = None

        self.new_total = None
        get_total = False

        if len(self.task) > 0:
            arg = self.task.popleft()

            if arg == 'overview':
                this_processor = update_overview(self.db, self.uid, self.form)

            else:
                get_total = True
                this_processor = update_list_data(self.db, self.uid, arg, self.form)

        """ decide whether the processor is valid """
        if this_processor is None:
            result = None
        elif this_processor.error:
            result = this_processor
        else:
            result = this_processor.process()

        if result is not None:
            self.error      = True if result is False else this_processor.error
            self.errorText  = this_processor.errorText
            self.data       = this_processor.data

            if get_total:
                self.new_total = this_processor.new_total

        else:
            self.error      = True
            self.errorText  = "Unknown task"

class add_delete(response):
    """ adds or deletes data to / from the database """
    def __init__(self, which, db, uid, task, args, form):
        self.form = form

        self.which = which

        super(add_delete, self).__init__(db, uid, task, args)

    def get_response(self):
        response = super(add_delete, self).get_response()

        if self.error is False and response is not None:
            """ add id and new total to response after adding item """
            response['extra'] = { 'total': self.new_total }

            if self.which == 'add':
                response['extra']['id'] = self.add_id

        return response

    def execute(self):
        super(add_delete, self).execute()

        table = None if len(self.task) == 0 else self.task.popleft()

        if table is None:
            self.error = True
            self.errorText = "Must provide a table"

        self.new_total  = None
        self.add_id     = None

        this_processor = None

        if self.which == 'add':
            this_processor = add_list_data(self.db, self.uid, table, self.form)
        elif self.which == 'delete':
            this_processor = delete_list_data(self.db, self.uid, table, self.form)

        if this_processor is None:
            self.error = True
            self.errorText = "Unknown server error"

            return

        result = this_processor if this_processor.error else this_processor.process()

        self.error      = True if result is False else this_processor.error
        self.errorText  = this_processor.errorText

        if self.error is False:
            self.new_total = this_processor.new_total

            if self.which == 'add':
                self.add_id = this_processor.add_id
