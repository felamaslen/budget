"""
Operates on (retrieve, add, edit, delete) data in the database
Does not handle authentication
"""

import time
from math import ceil
from datetime import datetime, timedelta
from itertools import groupby

from config import E_NO_PARAMS

class response(object):
    def __init__(self, db, uid, task):
        self.db = db
        self.uid = uid

        self.error      = False
        self.errorText  = ""
        self.data       = {}

        self.serverError = False

        self.task = task

        self.execute()

    def get_response(self):
        if self.serverError:
            return None

        response = {}
        response['error']       = self.error
        response['errorText']   = self.errorText
        response['data']        = self.data

        return response

    def execute(self):
        """ does the operation """
        if len(self.task) == 0:
            self.error = True
            self.errorText = "No parameter given"

            return


class retrieve(response):
    """ retrieves data from the database """
    def __init__(self, db, uid, task):
        super(retrieve, self).__init__(db, uid, task)

    def execute(self):
        super(retrieve, self).execute()

        this_processor = None

        arg = self.task.popleft()

        if arg == 'analysis':
            this_processor = analysis(self.db, self.uid, self.task)

        elif arg == 'analysis_category':
            this_processor = analysis_category(self.db, self.uid, self.task)

        result = None if this_processor is None else this_processor.process()

        if result is not None:
            self.error      = True if result is False else this_processor.error
            self.errorText  = this_processor.errorText
            self.data       = this_processor.data

        else:
            self.error      = True
            self.errorText  = "Unknown task"


class processor(object):
    def __init__(self, db, uid, task):
        self.db = db
        self.uid = uid

        self.error = False
        self.errorText = ""

        self.data = {}


class data_analysis(processor):
    def __init__(self, db, uid, task, num_params = 0):
        super(data_analysis, self).__init__(db, uid, task)

        self.categories = ['bills', 'food', 'general', 'holiday', 'social']
        self.periods    = ['week', 'month', 'year']
        self.groupings  = ['category', 'shop']

        self.e_invalid_category = "Invalid category"
        self.e_invalid_period   = "Invalid period"
        self.e_invalid_grouping = "Invalid grouping"
        self.e_invalid_index    = "Invalid index"

        if len(task) < num_params:
            self.error      = True
            self.errorText  = E_NO_PARAMS

    def process(self):
        self.condition = self.period_condition(self.period, self.index)

        self.valid_params = self.validate_task(self.period, self.grouping, self.index)


    def validate_task(self, period, grouping, index):
        valid = True

        if period not in self.periods:
            self.error      = True
            self.errorText  = self.e_invalid_period
            valid = False
        elif grouping not in self.groupings:
            self.error      = True
            self.errorText  = self.e_invalid_grouping
            valid = False
        elif not index >= 0:
            self.error      = True
            self.errorText  = self.e_invalid_index
            valid = False

        return valid

    def period_condition(self, period, index):
        now = datetime.now()

        if period == 'week':
            t0 = now - timedelta(days = now.weekday()) - timedelta(weeks = index)
            t1 = t0 + timedelta(weeks = 1)

            year0, month0, date0 = map(int, t0.strftime('%Y-%m-%d').split('-'))
            year1, month1, date1 = map(int, t1.strftime('%Y-%m-%d').split('-'))

            condition = """(
                year > %s OR (year = %s AND (month > %s OR (month = %s AND date >= %s)))
            ) AND (
                year < %s OR (year = %s AND (month < %s OR (month = %s AND month < %s)))
            )"""

            condition_args = [year0, year0, month0, month0, date0, year1, year1, month1, month1, date1]

            description = "Week beginning %s/%s/%s" % (date0, month0, year0)

        elif period == 'month':
            year = int(now.year - ceil(float(index + 1 - now.month) / 12))

            month = (now.month - index - 1) % 12 + 1

            if month <= 0:
                month += 12

            condition = "year = %s AND month = %s"

            condition_args = [year, month]

            months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"]

            description = "%s %s" % (months[month - 1], year)

        elif period == 'year':
            year = now.year - index

            condition = "year = %s"

            condition_args = [year]

            description = str(year)

        else:
            return None

        return {
            'query':    condition,
            'args':     condition_args,
            'desc':     description
        }

    def get_category_column(self, category, grouping):
        group = None

        if category == 'bills':
            group = 'item'

        elif grouping == 'category':
            if category == 'food' or category == 'general':
                group = 'category'

            elif category == 'social':
                group = 'society'

            elif category == 'holiday':
                group = 'holiday'

            else:
                group = 'item'

        elif grouping == 'shop':
            group = 'shop'

        return group


class analysis(data_analysis):
    """ gets analysis data """
    def __init__(self, db, uid, task):
        super(analysis, self).__init__(db, uid, task, 3)
        if self.error:
            return

        self.period, self.grouping, self.index = task

        self.index = int(self.index)

    def process(self):
        super(analysis, self).process()

        if self.valid_params is False:
            return False

        cost = [[category, self.get_items(category)] for category in self.categories]

        self.data['cost'] = cost
        self.data['description'] = self.condition['desc']

        return True

    def get_items(self, category):
        category_column = self.get_category_column(category, self.grouping)

        query = """
        SELECT `%s` AS item_col, SUM(cost) AS cost
        FROM `%s`
        WHERE %s AND uid = %d AND cost > 0
        GROUP BY item_col
        """ % (category_column, category, self.condition['query'], self.uid)

        result = self.db.query(query, self.condition['args'])

        if result is False:
            return None

        items = []

        for (item_col, cost) in result:
            items.append([item_col, int(cost)])

        return items


class analysis_category(data_analysis):
    """ gets deeper analysis data """
    def __init__(self, db, uid, task):
        super(analysis_category, self).__init__(db, uid, task, 4)
        if self.error:
            return

        self.category, self.period, self.grouping, self.index = task

        self.index = int(self.index)

    def process(self):
        super(analysis_category, self).process()

        if self.valid_params:
            if self.category not in self.categories:
                self.error      = True
                self.errorText  = self.e_invalid_category
                self.valid_params = False

            elif self.category == 'bills':
                self.error      = True
                self.errorText  = "Bills aren't categorised"
                self.valid_params = False

        if self.valid_params is False:
            return False

        items = self.get_items()

        self.data['items'] = items

        return True

    def get_items(self):
        category_column = self.get_category_column(self.category, self.grouping)

        query = """
        SELECT item, `%s` AS item_col, SUM(cost) AS cost
        FROM `%s`
        WHERE %s AND uid = %d AND cost > 0
        GROUP BY item, item_col
        ORDER BY item_col
        """ % (category_column, self.category, self.condition['query'], self.uid)

        result = self.db.query(query, self.condition['args'])

        if result is False:
            return None

        values = [[str(item_col), str(item), int(cost)] for (item, item_col, cost) in result]

        items = [[k, [x[1:] for x in g]] for k, g in groupby(values, key = lambda x: x[0])]

        return items
