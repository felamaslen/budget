"""
Display forms for editing and adding data
"""

import curses
from curses.textpad import Textbox, rectangle

from app.const import NC_COLOR_TAB, NC_COLOR_TAB_SEL, \
        BTN_CANCEL_TEXT, BTN_SUBMIT_TEXT, \
        KEYCODE_TAB, KEYCODE_NEWLINE, KEYCODE_RETURN
from app.methods import window_fill_color, alignc, \
        serialise_input, deserialise, \
        ellipsis
from app.api import BudgetClientAPIError

def draw_button(btn, highlight=False):
    color = curses.color_pair(NC_COLOR_TAB_SEL[0] if highlight else NC_COLOR_TAB[0])

    btn[0].clear()
    btn[0].addstr(0, 0, alignc(9, btn[1]), color)
    btn[0].refresh()

class FormEdit(object):
    """ Displays an interactive form for editing data """
    def __init__(self, callback, list_item, fields, table):
        self.api = callback['api']
        win = callback['win']
        dim = callback['dim']
        self.finished = callback['callback']

        self.data = {
            'item': list_item,
            'fields': fields,
            'table': table
        }

        self.updated = False

        form_h = min(dim[0], 3 * (3 + len(self.data['fields'])))
        form_w = min(dim[1], 40)

        self.form = {
            'h': form_h,
            'w': form_w,
            'y': (dim[0] - form_h) // 2,
            'x': (dim[1] - form_w) // 2,
            'tab_index': len(fields)
        }

        # subwindows
        self.win = {
            'form': win.derwin(self.form['h'], self.form['w'], self.form['y'], self.form['x']),
            'form_row': [],
            'field': [],
            'input': [],
            'input_values': []
        }

        self.win['statusbar'] = self.win['form'].derwin(3, self.form['w'] - 3, 2, 1)

        self.draw_window()

    def draw_window(self):
        # frame
        window_fill_color(self.win['form'], self.form['h'] - 1, self.form['w'] - 1, \
                curses.color_pair(NC_COLOR_TAB[0]))
        rectangle(self.win['form'], 0, 0, self.form['h'] - 2, self.form['w'] - 2)

        # title
        self.win['form'].addstr(1, 1, alignc(self.form['w'] - 3, \
                "Editing id #{}".format(self.data['item']['id'])))

        j = 0
        for (name, width, index, _) in self.data['fields']:
            self.win['form_row'].append(self.win['form'].derwin(\
                    3, self.form['w'] - 2, 5 + 3 * j, 1))
            self.win['form_row'][j].addstr(1, 0, ellipsis(name, self.form['w'] // 2, ".."))

            input_h = 1
            input_w = self.form['w'] // 2 - 1

            rectangle(self.win['form_row'][j], 0, self.form['w'] - input_w - 5, \
                    input_h + 1, self.form['w'] - 4)

            self.win['field'].append(self.win['form_row'][j].derwin(input_h, input_w, 1, \
                    self.form['w'] - input_w - 4))

            self.win['field'][j].addstr(0, 0, \
                    ellipsis(deserialise(self.data['item'][self.data['fields'][j][2]], \
                    self.data['fields'][j][2]).strip(' '), input_w - 1, ".."))

            self.win['input'].append(Textbox(self.win['field'][j]))

            self.win['input_values'].append(deserialise(self.data['item'][index], index, width - 1))

            self.win['form_row'][j].refresh()

            j += 1

        # form buttons
        self.btns = [
            [self.win['form'].derwin(1, 10, self.form['h'] - 3, self.form['w'] // 2 - 12), \
                    BTN_CANCEL_TEXT],
            [self.win['form'].derwin(1, 10, self.form['h'] - 3, self.form['w'] // 2 + 2), \
                    BTN_SUBMIT_TEXT]
        ]

        for i in range(len(self.btns)):
            draw_button(self.btns[i], i == 0)

        self.win['form'].refresh()

    def nav(self, difference):
        # navigate between form elements

        num_fields = len(self.data['fields'])

        # two buttons: cancel, submit
        new_index = (self.form['tab_index'] + difference) % (num_fields + 2)

        # deselect a button if it was selected
        if self.form['tab_index'] >= num_fields:
            draw_button(self.btns[self.form['tab_index'] - num_fields], highlight=False)

        self.form['tab_index'] = new_index

        if self.form['tab_index'] < num_fields:
            # select a form input
            curses.curs_set(1)
            self.win['input'][self.form['tab_index']].edit()

            self.win['input_values'][self.form['tab_index']] = \
                    self.win['input'][self.form['tab_index']].gather().strip(' ')
            self.nav(1)

        else:
            curses.curs_set(0)
            draw_button(self.btns[self.form['tab_index'] - num_fields], highlight=True)

    def status(self, msg):
        self.win['statusbar'].clear()
        self.win['statusbar'].addstr(0, 0, alignc(self.form['w'] - 2, msg))
        self.win['statusbar'].refresh()

    def key_input(self, key):
        if key == KEYCODE_TAB:
            self.nav(1)

        elif key == KEYCODE_NEWLINE or key == KEYCODE_RETURN:
            btn_index = self.form['tab_index'] - len(self.data['fields'])

            if btn_index == 1:
                # submit
                try:
                    data = {'id': self.data['item']['id']}

                    i = 0
                    for (_, _, index, _) in self.data['fields']:
                        data[index] = serialise_input(self.win['input_values'][i], index)
                        i += 1

                    self.status("Loading...")

                    try:
                        res = self.api.req(['update', self.data['table']], method='post', form=data)

                        if res and res['error'] is False:
                            self.status("")
                            self.updated = True

                            self.finished()
                        else:
                            raise BudgetClientAPIError(res.errorText)

                    except BudgetClientAPIError as code:
                        self.status("API error: {}!".format(code))

                except ValueError:
                    self.status("Error: bad data!")

                return False

            self.finished()

        return False

