from numpy import floor, ceil
import curses
from curses.textpad import rectangle

from app.const import *
from app.methods import *
from app.page import Page

class PageList(Page):
    def __init__(self, win, api, set_statusbar, data_name):
        self.data_name = data_name

        super().__init__(win, api, set_statusbar)

        self.color_item = curses.color_pair(NC_COLOR_TAB[0])
        self.color_sel  = curses.color_pair(NC_COLOR_TAB_SEL[0])

        self.color_up       = curses.color_pair(NC_COLOR_UP[0])
        self.color_down     = curses.color_pair(NC_COLOR_DOWN[0])
        self.color_up_sel   = curses.color_pair(NC_COLOR_UP_SEL[0])
        self.color_down_sel = curses.color_pair(NC_COLOR_DOWN_SEL[0])

        self.list_selected  = 0
        self.list           = self.calculate_data()
        self.win_list       = win.derwin(0, 0)

    def get_data(self):
        res = self.api.req(['data', self.data_name])

        return res['data']

    def draw(self):
        self.draw_list()

    def draw_list_row(self, i, offset):
        j = i + offset

        selected = self.nav_active and j == self.list_selected

        color = self.color_sel if selected else self.color_item

        self.win_list.addstr(i + 1, 0, ' ' * self.winHW[1], color)

        col = 0
        for (name, width, index, formatter) in self.cols:
            self.win_list.addstr(i + 1, col, formatter(self.list[j][index]), color)

            col += width

        return j, col, selected

    def draw_list(self):
        self.win_list.clear()

        """ draw list of funds """
        max_display = self.winHW[0] - 2
        num_display = min(max_display, len(self.data['data']))

        """ head """
        col = 0
        for (name, width, index, formatter) in self.cols:
            self.win_list.addstr(0, col, name, self.color_item | curses.A_BOLD)
            col += width

        """ body """
        offset = 0 if len(self.list) <= num_display else \
                max(0, min(len(self.list) - max_display, self.list_selected - 2)) # for scrolling

        for i in range(num_display):
            self.draw_list_row(i, offset)

    def nav(self, dx, dy):
        self.list_selected = min(len(self.list) - 1, max(0, \
                self.list_selected + dy))

        self.draw()
        self.win_list.refresh()

class PageFunds(PageList):
    def __init__(self, win, api, set_statusbar):
        self.cols = [
                ["Date",                9,  'date',  lambda x: YMD(x).format()],
                ["Item",                30, 'item',  lambda x: ellipsis(x, 29)],
                [alignr(9, "Cost"),     10, 'cost',  lambda x: format_currency(x, 9)],
                [alignr(9, "Value"),    10, 'value', lambda x: format_currency(x, 9)]
            ]

        self.statusbar = [
                [KEY_GRAPH, "graph"]
            ]

        super().__init__(win, api, set_statusbar, 'funds')

        self.graph_status   = False
        self.fund_history   = None

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

    def draw_list_row(self, i, offset):
        j, col, selected = super().draw_list_row(i, offset)

        gain        = float(self.list[j]['value'] - self.list[j]['cost']) / self.list[j]['cost'] * 100
        sign        = '-' if gain < 0 else '+'
        gain_text   = "%s%0.1f%%" % (sign, abs(gain))

        color_gain  = (self.color_up_sel if selected else self.color_up) \
                if gain >= 0 \
                else (self.color_down_sel if selected else self.color_down)

        self.win_list.addstr(i + 1, col, gain_text, color_gain)

    def draw_list(self):
        self.graph_status = False

        super().draw_list()

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
            index = self.list_selected

            fund_name = self.list[self.list_selected]['item']

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

    def key_input(self, c):
        do_graph_all = c == ord(KEY_GRAPH)
        do_graph_selected = self.nav_active and (c == KEYCODE_NEWLINE or c == KEYCODE_RETURN)

        if do_graph_all or do_graph_selected:
            self.graph_status = not self.graph_status

            if self.graph_status:
                self.show_graph(do_graph_all)
            else:
                self.hide_graph()

class PageIn(PageList):
    def __init__(self, win, api, set_statusbar):
        self.cols = [
                ["Date",                9,  'date',  lambda x: YMD(x).format()],
                ["Item",                30, 'item',  lambda x: ellipsis(x, 29)],
                [alignr(9, "Cost"),     10, 'cost',  lambda x: format_currency(x, 9)]
            ]

        super().__init__(win, api, set_statusbar, 'in')

    def calculate_data(self):
        return [{
                'date':     item['d'],
                'item':     item['i'],
                'cost':     item['c']
            } for item in self.data['data']]

