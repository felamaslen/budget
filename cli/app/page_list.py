"""
Classes of pages, all of which inherit from PageList
"""
import curses
from curses.textpad import rectangle
from numpy import floor, ceil

from app.const import NC_COLOR_TAB, NC_COLOR_TAB_SEL, \
        NC_COLOR_UP, NC_COLOR_UP_SEL, NC_COLOR_DOWN, NC_COLOR_DOWN_SEL, \
        KEY_EDIT, KEY_GRAPH, KEYCODE_NEWLINE, KEYCODE_RETURN, \
        CORNER_TOP_LEFT, CORNER_TOP_RIGHT, CORNER_BOTTOM_RIGHT, CORNER_BOTTOM_LEFT, \
        LINE_HORIZONTAL, LINE_VERTICAL

from app.methods import window_fill_color, \
        serialise, deserialise, \
        format_currency, get_tick_size, \
        alignr, alignc

from app.form import FormEdit
from app.page import Page

class PageList(Page):
    """ Displays a page of listed data (e.g. food, general, funds) """
    def __init__(self, win, api, set_statusbar, data_name):
        self.data_name = data_name

        self.statusbar = [
            [KEY_EDIT, "edit"]
        ]

        self.colors = {
            'item': curses.color_pair(NC_COLOR_TAB[0]),
            'sel': curses.color_pair(NC_COLOR_TAB_SEL[0])
        }

        self.list = {
            'list': [],
            'selected': 0,
            'win': win.derwin(0, 0)
        }

        self.form = {
            'form': None,
            'open': False
        }

        if not hasattr(self, 'cols'):
            self.cols = {'view': [], 'edit': []}

        super().__init__(win, api, set_statusbar)

        self.list['list'] = self.calculate_data()

    def get_data(self):
        res = self.api.req(['data', self.data_name])

        return res['data']

    def calculate_data(self):
        pass

    def draw(self):
        self.draw_list()

    def draw_list_row(self, i, offset):
        j = i + offset

        selected = self.nav_active and j == self.list['selected']

        color = self.colors['sel'] if selected else self.colors['item']

        self.list['win'].addstr(i + 1, 0, ' ' * self.winHW[1], color)

        if len(self.list['list']) <= j:
            return False

        col = 0
        for (_, width, index, _) in self.cols['view']:
            self.list['win'].addstr(i + 1, col, \
                    deserialise(self.list['list'][j][index], index, width - 1), color)

            col += width

        return j, col, selected

    def draw_list(self):
        self.list['win'].clear()

        # draw list of items
        max_display = self.winHW[0] - 2
        num_display = min(max_display, len(self.data['data']))

        # head
        index_alignr = ['cost', 'value']

        col = 0
        for (name, width, index, _) in self.cols['view']:
            if index in index_alignr:
                name = alignr(width - 1, name)

            self.list['win'].addstr(0, col, name, self.colors['item'] | curses.A_BOLD)
            col += width

        # body
        offset = 0 \
                if len(self.list['list']) <= num_display else \
                max(0, min(len(self.list['list']) - max_display, \
                self.list['selected'] - 2)) # for scrolling

        for i in range(num_display):
            self.draw_list_row(i, offset)

    def edit_form_finished(self, data=None):
        """ update data """
        if self.form['form'].updated:
            data = self.form['form'].input_values

            j = self.list['selected']

            for i, item in enumerate(data):
                self.data['data'][j][self.cols['edit'][i][3]] = serialise(item, \
                        self.cols['edit'][i][2])

            self.list['list'] = self.calculate_data()

        self.form['form'].win_form.clear()
        self.form['form'].win_form.refresh()

        del self.form['form']

        self.draw_list()
        self.list['win'].refresh()

        self.form['open'] = False

    def nav(self, dx, dy):
        if not self.form['open']:
            self.list['selected'] = min(len(self.list['list']) - 1, max(0, \
                    self.list['selected'] + dy))

            self.draw()
            self.list['win'].refresh()

    def key_input(self, c):
        if self.form['open']:
            return self.form['form'].key_input(c)

        elif c == ord(KEY_EDIT) and self.nav_active:
            self.form['form'] = FormEdit(self.win, self.winHW, self.api, \
                    self.list['list'][self.list['selected']], self.cols['edit'], \
                    self.edit_form_finished, self.data_name)

            self.form['open'] = True

        return True

class PageListBasic(PageList):
    def __init__(self, win, api, set_statusbar, page_name):
        view_cols = [
            ["Date", 9, 'date', 'd'],
            ["Item", 30, 'item', 'i'],
            ["Cost", 10, 'cost', 'c']
        ]

        self.cols = {
            'view': view_cols,
            'edit': view_cols
        }

        super().__init__(win, api, set_statusbar, page_name)

    def calculate_data(self):
        return [{
            'id':       item['I'],
            'date':     item['d'],
            'item':     item['i'],
            'cost':     item['c']
        } for item in self.data['data']]

class PageListShop(PageList):
    """ used for things like food, socials etc. """

    def __init__(self, win, api, set_statusbar, page):
        page_name = page[0]

        col_category = page[1]
        col_category_json = page[2]

        view_cols = [
            ["Date", 9, 'date', 'd'],
            ["Item", 25, 'item', 'i'],
            [col_category, 20, 'category', col_category_json],
            ["Cost", 10, 'cost', 'c'],
            ["Shop", 20, 'shop', 's']
        ]

        self.cols = {
            'view': view_cols,
            'edit': view_cols
        }

        self.col_category_json = col_category_json

        super().__init__(win, api, set_statusbar, page_name)

    def calculate_data(self):
        return [{
            'id':       item['I'],
            'date':     item['d'],
            'item':     item['i'],
            'category': item[self.col_category_json],
            'cost':     item['c'],
            'shop':     item['s']
        } for item in self.data['data']]

class PageFunds(PageList):
    """ Page displaying funds (with graphs and stuff) """

    def __init__(self, win, api, set_statusbar):
        view_cols = [
            ["Date", 9, 'date', 'd'],
            ["Item", 30, 'item', 'i'],
            ["Cost", 10, 'cost', 'c'],
            ["Value", 10, 'value', None]
        ]

        edit_cols = view_cols[:3] + ["Units", 10, 'units', 'u']

        self.cols = {
            'view': view_cols,
            'edit': edit_cols
        }

        super().__init__(win, api, set_statusbar, 'funds')

        self.statusbar += [
            [KEY_GRAPH, "graph"]
        ]

        self.colors['up'] = curses.color_pair(NC_COLOR_UP[0])
        self.colors['down'] = curses.color_pair(NC_COLOR_DOWN[0])
        self.colors['up_sel'] = curses.color_pair(NC_COLOR_UP_SEL[0])
        self.colors['down_sel'] = curses.color_pair(NC_COLOR_DOWN_SEL[0])

        graph_h = self.winHW[0] - 5
        graph_w = self.winHW[1] - 5

        self.graph = {
            'win': self.win.derwin(graph_h, graph_w, 3, 2),
            'h': graph_h,
            'w': graph_w,
            'active': False
        }

    def get_data(self):
        res = self.api.req(['data', 'funds'], query={'history': 1})

        return res['data']

    def calculate_data(self):
        return [{
            'id': item['I'],
            'date': item['d'],
            'item': item['i'],
            'cost': item['c'],
            'units': item['u'],
            'value': float(item['u']) * float(item['P'])
        } for item in self.data['data']]

    def draw_list_row(self, i, offset):
        list_row = super().draw_list_row(i, offset)

        if list_row is not False:
            j, col, selected = list_row

            gain = float(self.list['list'][j]['value'] - self.list['list'][j]['cost']) / \
                    self.list['list'][j]['cost'] * 100
            sign = '-' if gain < 0 else '+'
            gain_text = "%s%0.1f%%" % (sign, abs(gain))

            color_gain = (self.colors['up_sel'] if selected else self.colors['up']) \
                    if gain >= 0 \
                    else (self.colors['down_sel'] if selected else self.colors['down'])

            self.list['win'].addstr(i + 1, col, gain_text, color_gain)

    def draw_list(self):
        if hasattr(self, 'graph'):
            self.graph['active'] = False

        super().draw_list()

    def show_graph(self, graph_all):
        """ fill the window and add a frame """
        window_fill_color(self.graph['win'], self.graph['h'] - 1, self.graph['w'] - 1, \
                curses.color_pair(NC_COLOR_TAB[0]))
        rectangle(self.graph['win'], 0, 0, self.graph['h'] - 2, self.graph['w'] - 2)

        self.draw_graph(graph_all)

    def hide_graph(self):
        self.graph['win'].clear()
        self.graph['win'].refresh()

        self.draw_list()
        self.list['win'].refresh()

    def get_graph_data(self, graph_all, graph_w, history, extra):
        if graph_all:
            title = alignc(graph_w - 1, "Portfolio history")

            series = [history[0][2]] * extra + [
                history[i][2]
                for i in range(len(history))
            ]

        else:
            index = self.list['selected']

            fund_name = self.list['list'][self.list['selected']]['item']

            index = self.data['history']['funds'].index(fund_name)

            if index < 0:
                # invalid fund
                self.graph['win'].addstr(2, 1, "Invalid fund.")

                return False
            else:
                title = alignc(graph_w - 1, "Fund: {}".format(fund_name))

                series = [history[0][1][index]] * extra + [
                    history[i][1][index]
                    for i in range(len(history))
                ]

        return title, series

    def draw_graph_axis(self, graph_w, graph_range, series_height):
        num_ticks = 5
        tick_size = get_tick_size(graph_range[0], graph_range[1], num_ticks)

        for i in range(num_ticks):
            value = graph_range[0] + i * tick_size

            if value > graph_range[1]:
                break

            val_y = int(series_height * (1 - (float(value - graph_range[0]) / \
                    (graph_range[1] - graph_range[0]))))

            tick = format_currency(value, align=False, show_pence=False)
            val_x = graph_w - len(tick)

            self.graph['win'].addstr(val_y + 2, val_x, tick)

    def draw_graph_data(self, title, series, graph_w, graph_h):
        self.graph['win'].addstr(1, 1, title)

        graph_range = [floor(float(min(series)) / 1000) * 1000, \
                ceil(float(max(series)) / 1000) * 1000]

        last_yv = None
        series_height = graph_h - 3

        # draw line
        for i in range(graph_w - 2):
            val_y = int(series_height * (1 - (float(series[i] - graph_range[0]) / \
                    (graph_range[1] - graph_range[0]))))

            point = LINE_HORIZONTAL

            if last_yv is not None:
                diff = val_y - last_yv

                if diff != 0:
                    # draw a line from the last point to this one
                    start = val_y + 1 if diff < 0 else last_yv + 1
                    length = abs(diff) - 1

                    for this_y in range(length):
                        self.graph['win'].addstr(this_y + start + 2, i + 1, LINE_VERTICAL)

                    if diff < 0: # value has increased (y axis is inverted)
                        self.graph['win'].addstr(start + length + 2, i + 1, CORNER_BOTTOM_RIGHT)

                        point = CORNER_TOP_LEFT
                    else:
                        self.graph['win'].addstr(start + 1, i + 1, CORNER_TOP_RIGHT)

                        point = CORNER_BOTTOM_LEFT

            self.graph['win'].addstr(val_y + 2, i + 1, point)

            last_yv = val_y

        # draw axis
        self.draw_graph_axis(graph_w, graph_range, series_height)

    def draw_graph(self, graph_all):
        graph_h = self.graph['h'] - 2
        graph_w = self.graph['w'] - 2 # for border

        series_length = graph_w - 2
        history = self.data['history']['history'][-series_length:]
        extra = max(0, series_length - len(history))

        graph_data = self.get_graph_data(graph_all, graph_w, history, extra)

        ## gather data

        if graph_data is not False:
            title, series = graph_data

            # draw the actual graph
            self.draw_graph_data(title, series, graph_w, graph_h)

        self.graph['win'].refresh()

    def key_input(self, c):
        do_graph_all = c == ord(KEY_GRAPH)
        do_graph_selected = self.nav_active and (c == KEYCODE_NEWLINE or c == KEYCODE_RETURN)

        if not self.form['open']:
            if do_graph_all or do_graph_selected:
                self.graph['active'] = not self.graph['active']

                if self.graph['active']:
                    self.show_graph(do_graph_all)
                else:
                    self.hide_graph()

        elif not self.graph['active']:
            return super().key_input(c)

        return True

class PageIn(PageListBasic):
    def __init__(self, win, api, set_statusbar):
        super().__init__(win, api, set_statusbar, 'in')

class PageBills(PageListBasic):
    def __init__(self, win, api, set_statusbar):
        super().__init__(win, api, set_statusbar, 'bills')

class PageFood(PageListShop):
    def __init__(self, win, api, set_statusbar):
        super().__init__(win, api, set_statusbar, ['food', "Category", 'k'])

class PageGeneral(PageListShop):
    def __init__(self, win, api, set_statusbar):
        super().__init__(win, api, set_statusbar, ['general', "Category", 'k'])

class PageHoliday(PageListShop):
    def __init__(self, win, api, set_statusbar):
        super().__init__(win, api, set_statusbar, ['holiday', "Holiday", 'h'])

class PageSocial(PageListShop):
    def __init__(self, win, api, set_statusbar):
        super().__init__(win, api, set_statusbar, ['social', "Society", 'y'])

