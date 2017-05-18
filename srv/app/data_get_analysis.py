""" get analysis data """

from itertools import groupby
from datetime import timedelta, datetime
from math import ceil

from app.api_data_methods import Processor
from app.misc import strng
from app.config import E_NO_PARAMS

def get_category_column(category, grouping):
    """ gets database column corresponding to 'category' type """
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

def period_condition_weekly(NOW, index):
    """ database query for weekly period """
    t_0 = NOW - timedelta(days=NOW.weekday()) - timedelta(weeks=index)
    t_1 = t_0 + timedelta(weeks=1)

    year0, month0, date0 = [int(x) \
            for x in t_0.strftime('%Y-%m-%d').split('-')]
    year1, month1, date1 = [int(x) \
            for x in t_1.strftime('%Y-%m-%d').split('-')]

    condition = """(
        year > %s OR (year = %s AND (month > %s OR (month = %s AND date >= %s)))
    ) AND (
        year < %s OR (year = %s AND (month < %s OR (month = %s AND date < %s)))
    )"""

    condition_args = [year0, year0, month0, month0, date0, \
            year1, year1, month1, month1, date1]

    description = "Week beginning %s/%s/%s" % (date0, month0, year0)

    return condition, condition_args, description

def period_condition_monthly(NOW, index):
    """ database query for monthly period """
    year = int(NOW.year - ceil(float(index + 1 - NOW.month) / 12))

    month = (NOW.month - index - 1) % 12 + 1

    if month <= 0:
        month += 12

    condition = "year = %s AND month = %s"
    condition_args = [year, month]

    months = ["January", "February", "March", "April", "May", \
            "June", "July", "August", "September", \
            "October", "November", "December"]

    description = "%s %s" % (months[month - 1], year)

    return condition, condition_args, description

def period_condition_yearly(NOW, index):
    """ database query for yearly period """
    year = NOW.year - index

    condition = "year = %s"
    condition_args = [year]
    description = str(year)

    return condition, condition_args, description

def period_condition(NOW, period, index):
    """ produces a database query condition string from parameters """
    if period == 'week':
        condition, args, desc = period_condition_weekly(NOW, index)

    elif period == 'month':
        condition, args, desc = period_condition_monthly(NOW, index)

    elif period == 'year':
        condition, args, desc = period_condition_yearly(NOW, index)

    else:
        return None

    return {
        'query':    condition,
        'args':     args,
        'desc':     desc
    }

class DataAnalysis(Processor):
    """ parent class for analysis and analysis category data """
    def __init__(self, db, uid, task, num_params=0):
        super(DataAnalysis, self).__init__(db, uid)

        self.dbx_col = {
            'categories': ['bills', 'food', 'general', 'holiday', 'social'],
            'periods': ['week', 'month', 'year'],
            'groupings': ['category', 'shop']
        }

        self.error_msg = {
            'invalid_category': "Invalid category",
            'invalid_period': "Invalid period",
            'invalid_grouping': "Invalid grouping",
            'invalid_index': "Invalid index"
        }

        self.condition = None

        self.valid_params = False

        self.param = {
            'grouping': None,
            'period': None,
            'index': None
        }

        if len(task) < num_params:
            self.error = True
            self.error_text = E_NO_PARAMS

    def process(self):
        """ get the query to execute """
        NOW = datetime.now()

        self.condition = period_condition(NOW, self.param['period'], \
                self.param['index'])

        self.valid_params = self.validate_task(self.param['period'], \
                self.param['grouping'], self.param['index'])

    def validate_task(self, period, grouping, index):
        """ validate user parameters """
        valid = True

        if period not in self.dbx_col['periods']:
            self.error = True
            self.error_text = self.error_msg['invalid_period']
            valid = False
        elif grouping not in self.dbx_col['groupings']:
            self.error = True
            self.error_text = self.error_msg['invalid_grouping']
            valid = False
        elif index < 0:
            self.error = True
            self.error_text = self.error_msg['invalid_index']
            valid = False

        return valid

class Analysis(DataAnalysis):
    """ gets analysis data """
    def __init__(self, db, uid, task):
        super(Analysis, self).__init__(db, uid, task, 3)
        if self.error:
            return

        self.param['period'], self.param['grouping'], self.param['index'] = task

        try:
            self.param['index'] = int(self.param['index'])
        except ValueError:
            self.param['index'] = 0

    def process(self):
        super(Analysis, self).process()

        if self.valid_params is False:
            return False

        cost = [[category, self.get_items(category)] \
                for category in self.dbx_col['categories']]

        self.data['cost'] = cost
        self.data['description'] = self.condition['desc']

        return True

    def get_items(self, category):
        """ get data from database """
        category_column = get_category_column(category, self.param['grouping'])

        query = """
        SELECT `%s` AS item_col, SUM(cost) AS cost
        FROM `%s`
        WHERE %s AND uid = %d AND cost > 0
        GROUP BY item_col
        """ % (category_column, category, self.condition['query'], self.uid)

        result = self.dbx.query(query, self.condition['args'])

        if result is False:
            return None

        items = []

        for (item_col, cost) in result:
            items.append([item_col, int(cost)])

        return items

class AnalysisCategory(DataAnalysis):
    """ gets deeper analysis data """
    def __init__(self, db, uid, task):
        super(AnalysisCategory, self).__init__(db, uid, task, 4)
        if self.error:
            return

        self.category, self.param['period'], self.param['grouping'], \
                self.param['index'] = task

        try:
            self.param['index'] = int(self.param['index'])
        except ValueError:
            self.param['index'] = 0

        self.valid_params = True

    def process(self):
        super(AnalysisCategory, self).process()

        if self.valid_params:
            if self.category not in self.dbx_col['categories']:
                self.error = True
                self.error_text = self.error_msg['invalid_category']
                self.valid_params = False

            elif self.category == 'bills':
                self.error = True
                self.error_text = "Bills aren't categorised"
                self.valid_params = False

        if self.valid_params is False:
            return False

        items = self.get_items()

        self.data['items'] = items

        return True

    def get_items(self):
        """ get data from the database """
        category_column = get_category_column(self.category, \
                self.param['grouping'])

        query = """
        SELECT item, `%s` AS item_col, SUM(cost) AS cost
        FROM `%s`
        WHERE %s AND uid = %d AND cost > 0
        GROUP BY item, item_col
        ORDER BY item_col
        """ % (category_column, self.category, \
                self.condition['query'], self.uid)

        result = self.dbx.query(query, self.condition['args'])

        if result is False:
            return None

        values = [[strng(item_col), strng(item), int(cost)] \
                for (item, item_col, cost) in result]

        items = [[k, [x[1:] for x in g]] \
                for k, g in groupby(values, key=lambda x: x[0])]

        return items

