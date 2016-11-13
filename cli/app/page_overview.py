from app.const import *
from app.methods import *
from app.page import Page

class PageOverview(Page):
    def __init__(self, win, api, set_statusbar):
        self.cols = [
            ["Month",       8],
            ["In",          10],
            ["Out",         10],
            ["Net",         10],
            ["Predicted",   12],
            ["Balance",     10]
        ]

        self.future_cols = ['food', 'general', 'holiday', 'social']

        super().__init__(win, api, set_statusbar)

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
                format_currency(self.data['cost']['in'][i],      self.cols[1][1] - 1),
                format_currency(out_with_future[i],              self.cols[2][1] - 1),
                format_currency(net[i],                          self.cols[3][1] - 1),
                format_currency(predicted[i],                    self.cols[4][1] - 1),
                format_currency(self.data['cost']['balance'][i], self.cols[5][1] - 1)
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


