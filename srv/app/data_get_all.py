""" Get all data (used on mobile app) """

from app.config import LIST_CATEGORIES
from app.api_data_methods import Processor
from app.data_get import ListData
from app.data_get_overview import Overview
from app.data_get_funds import Funds

class ListAll(Processor):
    """ gets all list data """
    def __init__(self, db, uid):
        self.tables = ['overview'] + list(LIST_CATEGORIES)

        super(ListAll, self).__init__(db, uid)

    def process(self):
        processors = [Overview(self.dbx, self.uid), \
                Funds(self.dbx, self.uid)] + \
                [ListData(self.dbx, self.uid, table) \
                for table in LIST_CATEGORIES if table != 'funds']

        for key in range(len(self.tables)):
            processor = processors[key]

            if processor.error:
                self.error_text = processor.error_text
                return False

            result = processor.process()

            if result is False:
                return False

            table = self.tables[key]

            self.data[table] = processor.data

        return True

