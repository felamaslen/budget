import curses

from app.methods import ellipsis, format_currency

class PageOverview(object):
    def __init__(self, win, api):
        self.win = win
        self.api = api

        self.data = self.get_data()

        self.draw()

    def switch_to(self):
        self.win.clear()
        self.draw()
        self.win.refresh()

    def get_data(self):
        try:
            res = self.api.req(['data', 'overview'])
        except Exception as code:
            return "Error: {}".format(code)

        return res['data']

    def draw(self):
        """ calculate table values """
        ym1 = self.data['startYearMonth']
        ym2 = self.data['endYearMonth']
        ymc = [self.data['currentYear'], self.data['currentMonth']]

        num_months = 12 * (ym2[0] - ym1[0]) + ym2[1] - ym1[1] + 1

        num_rows = min(curses.LINES - 4, num_months)

        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        cols = [
            ["Month",   8],
            ["In",      10],
            ["Out",     10],
            ["Net",     10],
            ["Pred.",   10],
            ["Balance", 10]
        ]

        """ calculate futures based on averages """
        future_key = 12 * (ymc[0] - ym1[0]) + ymc[1] - ym1[1] + 1

        future_cols = ['food', 'general', 'holiday', 'social']

        average = [
                sum([self.data['cost'][col][i] for i in range(future_key)]) / future_key
                for col in future_cols
            ]

        out_with_future = [
                sum([self.data['cost'][col][i] if i < future_key else average[index] \
                        for (index, col) in enumerate(future_cols)]) \
                        + self.data['cost']['bills'][i]
                for i in range(num_months)
            ]

        """ net spending """
        net = [
                self.data['cost']['in'][i] - out_with_future[i]
                for i in range(num_months)
            ]

        """ calculate predicted balance based on future spending predictions """
        predicted = [
                self.data['cost']['balance'][max(0, i - 1)] + net[i]
                for i in range(future_key + 1)]
        for i in range(num_months - future_key):
            predicted.append(predicted[future_key + i - 1] + net[i])

        rows = [
            [
                "{}-{}".format(months[(ym1[1]-1+i) % 12], (ym1[0] + (i - 1 + ym1[1]) // 12) % 1000),
                format_currency(self.data['cost']['in'][i]),
                format_currency(out_with_future[i]),
                format_currency(net[i]),
                format_currency(predicted[i]),
                format_currency(self.data['cost']['balance'][i])
            ]
            for i in range(num_months)
        ]

        """ draw all the rows and columns """
        for i in range(num_rows):
            if i == 0:
                """ header """
                col = 0
                for (col_name, col_width) in cols:
                    self.win.addstr(0, col, col_name)

                    col += col_width
            else:
                """ data """
                row = num_months - num_rows + i - 1 + 1

                col = 0
                j = 0
                for (j, (col_name, col_width)) in enumerate(cols):
                    self.win.addstr(i, col, ellipsis(rows[row][j], col_width))

                    col += col_width


