import curses

from app.const import NC_COLOR_TAB, NC_COLOR_TAB_SEL
from app.methods import ellipsis, format_currency, YMD, alignr
from app.api import BudgetClientAPIError

class Page(object):
    def __init__(self, win, api):
        self.win = win
        self.api = api

        self.winHW = win.getmaxyx()

        self.data = self.try_get_data()

        self.try_draw()

    def switch_to(self):
        self.win.clear()
        self.try_draw()
        self.win.refresh()

    def try_get_data(self):
        try:
            data = self.get_data()

            return data
        except BudgetClientAPIError as code:
            self.win.addstr(0, 0, "API error: {}".format(code))
            return None
        except:
            self.win.addstr(0, 0, "API error: unknown error!")
            return None

    def try_draw(self):
        if self.data is None:
            return

        try:
            self.draw()
        except Exception as e:
            self.win.addstr(0, 0, "Error: drawing page failed! ({})".format(e))

class PageOverview(Page):
    def __init__(self, win, api):
        self.cols = [
            ["Month",       8],
            ["In",          10],
            ["Out",         10],
            ["Net",         10],
            ["Predicted",   12],
            ["Balance",     10]
        ]

        self.future_cols = ['food', 'general', 'holiday', 'social']

        super().__init__(win, api)

    def get_data(self):
        res = self.api.req(['data', 'overview'])

        return res['data']

    def calculate_data(self):
        """ calculates future spending data based on past averages """

        """ calculate table values """
        ym1 = self.data['startYearMonth']
        ym2 = self.data['endYearMonth']
        ymc = [self.data['currentYear'], self.data['currentMonth']]

        """ number of months (inclusive) since the start month """
        num_rows = 12 * (ym2[0] - ym1[0]) + ym2[1] - ym1[1] + 1

        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        """ calculate futures based on averages """
        future_key = 12 * (ymc[0] - ym1[0]) + ymc[1] - ym1[1] + 1

        average = [
                sum([self.data['cost'][col][i] for i in range(future_key)]) / future_key
                for col in self.future_cols
            ]

        out_with_future = [
                sum([self.data['cost'][col][i] if i < future_key else average[index] \
                        for (index, col) in enumerate(self.future_cols)]) \
                        + self.data['cost']['bills'][i]
                for i in range(num_rows)
            ]

        """ net spending """
        net = [
                self.data['cost']['in'][i] - out_with_future[i]
                for i in range(num_rows)
            ]

        """ calculate predicted balance based on future spending predictions """
        predicted = [
                self.data['cost']['balance'][max(0, i - 1)] + net[i]
                for i in range(future_key + 1)]
        for i in range(future_key + 1, num_rows):
            predicted.append(int(predicted[i - 1] + net[i]))

        rows = [
            [
                "{}-{}".format(months[(ym1[1]-1+i) % 12], (ym1[0] + (i - 1 + ym1[1]) // 12) % 1000),
                format_currency(self.cols[1][1] - 1, self.data['cost']['in'][i]),
                format_currency(self.cols[2][1] - 1, out_with_future[i]),
                format_currency(self.cols[3][1] - 1, net[i]),
                format_currency(self.cols[4][1] - 1, predicted[i]),
                format_currency(self.cols[5][1] - 1, self.data['cost']['balance'][i])
            ]
            for i in range(num_rows)
        ]

        return rows

    def draw(self):
        rows = self.calculate_data()

        num_rows    = len(rows)
        num_display = min(self.winHW[0], num_rows)

        """ draw all the rows and columns """
        for i in range(num_display):
            if i == 0:
                """ header """
                col = 0
                for (col_name, col_width) in self.cols:
                    self.win.addstr(0, col, alignr(col_width - 1, col_name))

                    col += col_width
            else:
                """ data """
                row = num_rows - num_display + i - 1 + 1

                col = 0
                j = 0
                for (j, (col_name, col_width)) in enumerate(self.cols):
                    self.win.addstr(i, col, ellipsis(rows[row][j], col_width))

                    col += col_width

class PageFunds(Page):
    def __init__(self, win, api):
        super().__init__(win, api)

        self.fund_list_selected = 0

        self.win_funds = win.derwin(0, 0)

        self.color_item = curses.color_pair(NC_COLOR_TAB[0])
        self.color_sel  = curses.color_pair(NC_COLOR_TAB_SEL[0])

    def get_data(self):
        res = self.api.req(['data', 'funds'])

        return res['data']

    def calculate_data(self):
        return [{
                'date':     item['d'],
                'item':     item['i'],
                'cost':     item['c'],
                'value':    float(item['u']) * float(item['P'])
            } for item in self.data['data']]

    def draw(self):
        self.win_funds.clear()

        funds = self.calculate_data()

        """ draw list of funds """
        num_display = min(self.winHW[0] - 1, len(self.data['data']))

        cols = [
                ["Date",                9,  'date',  lambda x: YMD(x).format()],
                ["Item",                30, 'item',  lambda x: ellipsis(x, 29)],
                [alignr(9, "Cost"),     10, 'cost',  lambda x: format_currency(9, x)],
                [alignr(9, "Value"),    10, 'value', lambda x: format_currency(9, x)]
            ]

        """ head """
        col = 0
        for (name, width, index, formatter) in cols:
            self.win_funds.addstr(0, col, name, self.color_item | curses.A_BOLD)
            col += width

        """ body """
        for i in range(num_display):
            color = self.color_sel if i == self.fund_list_selected else self.color_item

            self.win_funds.addstr(i + 1, 0, ' ' * self.winHW[1], color)

            col = 0
            for (name, width, index, formatter) in cols:
                self.win_funds.addstr(i + 1, col, formatter(funds[i][index]), color)

                col += width



