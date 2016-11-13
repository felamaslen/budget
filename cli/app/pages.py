from numpy import floor, ceil
import curses
from curses.textpad import rectangle

from app.const import *
from app.methods import *
from app.api import BudgetClientAPIError

class Page(object):
    def __init__(self, win, api):
        self.win = win
        self.api = api

        self.nav_active = False

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

    def nav(self, dx, dy):
        pass

    def set_nav_active(self, status):
        self.nav_active = status
        self.nav(0, 0)

    def key_input(self, c):
        pass

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

class PageFunds(Page):
    def __init__(self, win, api):
        super().__init__(win, api)

        self.fund_list_selected = 0

        self.win_funds = win.derwin(0, 0)

        self.graph_status = False

        self.fund_history = None

        self.color_item = curses.color_pair(NC_COLOR_TAB[0])
        self.color_sel  = curses.color_pair(NC_COLOR_TAB_SEL[0])

        self.color_up       = curses.color_pair(NC_COLOR_UP[0])
        self.color_down     = curses.color_pair(NC_COLOR_DOWN[0])
        self.color_up_sel   = curses.color_pair(NC_COLOR_UP_SEL[0])
        self.color_down_sel = curses.color_pair(NC_COLOR_DOWN_SEL[0])

        self.funds = self.calculate_data()

        self.cols = [
                ["Date",                9,  'date',  lambda x: YMD(x).format()],
                ["Item",                30, 'item',  lambda x: ellipsis(x, 29)],
                [alignr(9, "Cost"),     10, 'cost',  lambda x: format_currency(x, 9)],
                [alignr(9, "Value"),    10, 'value', lambda x: format_currency(x, 9)]
            ]

    def get_data(self):
        res = self.api.req(['data', 'funds'])

        return res['data']

    def get_fund_history(self):
        res = self.api.req(['data', 'fund_history'], query = {'deep': 1})

        return res['data']

    def calculate_data(self):
        return [{
                'date':     item['d'],
                'item':     item['i'],
                'cost':     item['c'],
                'value':    float(item['u']) * float(item['P'])
            } for item in self.data['data']]

    def draw(self):
        self.draw_list()

    def draw_list(self):
        self.win_funds.clear()

        """ draw list of funds """
        num_display = min(self.winHW[0] - 1, len(self.data['data']))

        """ head """
        col = 0
        for (name, width, index, formatter) in self.cols:
            self.win_funds.addstr(0, col, name, self.color_item | curses.A_BOLD)
            col += width

        """ body """
        offset = 0 if len(self.funds) <= num_display else max(0, self.fund_list_selected - 2) # for scrolling

        for i in range(num_display):
            j = i + offset

            selected = self.nav_active and j == self.fund_list_selected

            color = self.color_sel if selected else self.color_item

            self.win_funds.addstr(i + 1, 0, ' ' * self.winHW[1], color)

            col = 0
            for (name, width, index, formatter) in self.cols:
                self.win_funds.addstr(i + 1, col, formatter(self.funds[j][index]), color)

                col += width

            gain        = float(self.funds[j]['value'] - self.funds[j]['cost']) / self.funds[j]['cost'] * 100
            sign        = '-' if gain < 0 else '+'
            gain_text   = "%s%0.1f%%" % (sign, abs(gain))

            color_gain  = (self.color_up_sel if selected else self.color_up) \
                    if gain >= 0 \
                    else (self.color_down_sel if selected else self.color_down)

            self.win_funds.addstr(i + 1, col, gain_text, color_gain)

    def show_graph(self, graph_all):
        graphH = self.winHW[0] - 5
        graphW = self.winHW[1] - 5

        self.win_graph = self.win.derwin(graphH, graphW, 3, 2)

        """ fill the window and add a frame """
        window_fill_color(self.win_graph, graphH - 1, graphW - 1, curses.color_pair(NC_COLOR_TAB[0]))
        rectangle(self.win_graph, 0, 0, graphH - 2, graphW - 2)

        if self.fund_history is None:
            self.win_graph.addstr(1, 1, alignc(graphW - 3, "Loading..."))
            self.win_graph.refresh()

            try:
                self.fund_history = self.get_fund_history()

                self.draw_graph(graphW, graphH, graph_all)
            except BudgetClientAPIError as error:
                self.win_graph.clear()
                self.win_graph.addstr(2, 2, "Error: {}".format(error))
                self.win_graph.refresh()

                self.fund_history = None

        else:
            self.draw_graph(graphW, graphH, graph_all)

    def hide_graph(self):
        self.win_graph.clear()
        self.win_graph.refresh()

        del self.win_graph

        self.draw_list()
        self.win.refresh()

    def draw_graph(self, graphW, graphH, graph_all):
        w = graphW - 2 # for border
        h = graphH - 2

        series_length   = w - 2
        history         = self.fund_history['history'][-series_length:]
        extra           = max(0, series_length - len(history))

        draw_graph = True

        """ gather data """
        if graph_all:
            title = alignc(w - 1, "Portfolio history")

            series = [history[0][2]] * extra + [
                    history[i][2]
                    for i in range(len(history))
                ]

        else:
            index = self.fund_list_selected

            fund_name = self.funds[self.fund_list_selected]['item']

            index = self.fund_history['funds'].index(fund_name)

            if index < 0:
                """ invalid fund """
                self.win_graph.addstr(2, 1, "Invalid fund.")

                draw_graph = False
            else:
                title = alignc(w - 1, "Fund: {}".format(fund_name))

                series = [history[0][1][index]] * extra + [
                        history[i][1][index]
                        for i in range(len(history))
                    ]

        """ draw the actual graph """
        if draw_graph:
            self.win_graph.addstr(1, 1, title)

            minV = floor(float(min(series)) / 1000) * 1000
            maxV = ceil(float(max(series)) / 1000) * 1000

            last_yv = None

            series_height = h - 3

            """ draw line """
            for i in range(series_length):
                yv = int(series_height * (1 - (float(series[i] - minV) / (maxV - minV))))

                point = LINE_HORIZONTAL

                if not last_yv is None:
                    diff = yv - last_yv

                    if diff != 0:
                        """ draw a line from the last point to this one """
                        start = yv + 1 if diff < 0 else last_yv + 1
                        length = abs(diff) - 1

                        for y in range(length):
                            self.win_graph.addstr(y + start + 2, i + 1, LINE_VERTICAL)

                        if diff < 0: # value has increased (y axis is inverted)
                            self.win_graph.addstr(start + length + 2, i + 1, CORNER_BOTTOM_RIGHT)

                            point = CORNER_TOP_LEFT
                        else:
                            self.win_graph.addstr(start + 1, i + 1, CORNER_TOP_RIGHT)

                            point = CORNER_BOTTOM_LEFT

                self.win_graph.addstr(yv + 2, i + 1, point)

                last_yv = yv

            """ draw axis """
            num_ticks = 5
            tick_size = get_tick_size(minV, maxV, num_ticks)

            for i in range(num_ticks):
                value = minV + i * tick_size

                yv = int(series_height * (1 - (float(value - minV) / (maxV - minV))))

                tick = format_currency(value, align = False, show_pence = False)

                xv = w - len(tick)

                try:
                    self.win_graph.addstr(yv + 2, xv, tick)
                except:
                    pass # means the tick is out of range, no big deal

        self.win_graph.refresh()

    def nav(self, dx, dy):
        self.fund_list_selected = min(len(self.funds) - 1, max(0, \
                self.fund_list_selected + dy))

        self.draw()
        self.win_funds.refresh()

    def key_input(self, c):
        if self.nav_active:
            do_graph_all = c == ord(KEY_GRAPH)
            do_graph_selected = c == KEYCODE_NEWLINE or c == KEYCODE_RETURN

            if do_graph_all or do_graph_selected:
                self.graph_status = not self.graph_status

                if self.graph_status:
                    self.show_graph(do_graph_all)
                else:
                    self.hide_graph()

