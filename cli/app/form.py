import curses
from curses.textpad import Textbox, rectangle

from app.const import *
from app.methods import *
from app.api import BudgetClientAPIError

class FormEdit:
    def __init__(self, win, winHW, api, list_item, fields, finished, table):
        self.win    = win
        self.api    = api
        self.item   = list_item
        self.fields = fields
        self.table  = table

        self.finished   = finished
        self.updated    = False

        self.formH = min(winHW[0], 3 * (3 + len(self.fields)))
        self.formW = min(winHW[1], 40)

        formY = (winHW[0] - self.formH) // 2
        formX = (winHW[1] - self.formW) // 2

        self.tab_index = len(fields)

        self.win_form = win.derwin(self.formH, self.formW, formY, formX)

        self.draw_window()

    def draw_window(self):
        """ frame """
        window_fill_color(self.win_form, self.formH - 1, self.formW - 1, curses.color_pair(NC_COLOR_TAB[0]))
        rectangle(self.win_form, 0, 0, self.formH - 2, self.formW - 2)

        """ title """
        self.win_form.addstr(1, 1, alignc(self.formW - 3, \
                "Editing id #{}".format(self.item['id'])))

        """ status bar """
        self.win_statusbar = self.win_form.derwin(3, self.formW - 3, 2, 1)

        """ form inputs """
        self.win_form_row   = []
        self.win_field      = []
        self.input          = []

        self.input_values   = []

        j = 0
        for (name, width, index, tbl) in self.fields:
            self.win_form_row.append(self.win_form.derwin(3, self.formW - 2, 5 + 3 * j, 1))
            self.win_form_row[j].addstr(1, 0, ellipsis(name, self.formW // 2, ".."))

            inputH = 1
            inputW = self.formW // 2 - 1

            rectangle(self.win_form_row[j], 0, self.formW - inputW - 5 , inputH + 1, self.formW - 4)

            self.win_field.append(self.win_form_row[j].derwin(inputH, inputW, 1, self.formW - inputW - 4))

            self.win_field[j].addstr(0, 0, \
                    ellipsis(deserialise(self.item[self.fields[j][2]], self.fields[j][2]).strip(' '),\
                    inputW - 1, ".."))

            self.input.append(Textbox(self.win_field[j]))

            self.input_values.append(deserialise(self.item[index], index, width - 1))

            self.win_form_row[j].refresh()

            j += 1

        """ form buttons """
        self.btns = [
                [self.win_form.derwin(1, 10, self.formH - 3, self.formW // 2 - 12), BTN_CANCEL_TEXT],
                [self.win_form.derwin(1, 10, self.formH - 3, self.formW // 2 + 2),  BTN_SUBMIT_TEXT]
            ]

        for i in range(len(self.btns)):
            self.draw_button(self.btns[i], i == 0)

        self.win_form.refresh()

    def draw_button(self, btn, highlight = False):
        color = curses.color_pair(NC_COLOR_TAB_SEL[0] if highlight else NC_COLOR_TAB[0])

        btn[0].clear()
        btn[0].addstr(0, 0, alignc(9, btn[1]), color)
        btn[0].refresh()

    def nav(self, difference):
        """ navigate between form elements """

        num_fields  = len(self.fields)
        new_index   = (self.tab_index + difference) % (num_fields + 2) # two buttons: cancel, submit

        """ deselect a button if it was selected """
        if self.tab_index >= num_fields:
            self.draw_button(self.btns[self.tab_index - num_fields], highlight = False)

        self.tab_index = new_index

        if self.tab_index < num_fields:
            """ select a form input """
            curses.curs_set(1)
            self.input[self.tab_index].edit()

            self.input_values[self.tab_index] = self.input[self.tab_index].gather().strip(' ')
            self.nav(1)

        else:
            curses.curs_set(0)
            self.draw_button(self.btns[self.tab_index - num_fields], highlight = True)

    def status(self, msg):
        self.win_statusbar.clear()
        self.win_statusbar.addstr(0, 0, alignc(self.formW - 2, msg))
        self.win_statusbar.refresh()

    def key_input(self, c):
        if c == KEYCODE_TAB:
            self.nav(1)

        elif c == KEYCODE_NEWLINE or c == KEYCODE_RETURN:
            btn_index = self.tab_index - len(self.fields)

            if btn_index == 1:
                """ submit """
                try:
                    data = {'id': self.item['id']}

                    i = 0
                    for (name, width, index, tbl) in self.fields:
                        data[index] = serialise_input(self.input_values[i], index)
                        i += 1

                    self.status("Loading...")

                    try:
                        res = self.api.req(['update', self.table], method = 'post', form = data)

                        if res and res['error'] is False:
                            self.status("")
                            self.updated = True

                            self.finished()
                        else:
                            raise BudgetClientAPIError(res.errorText)

                    except BudgetClientAPIError as code:
                        self.status("API error: {}!".format(code))

                except ValueError as error:
                    self.status("Error: bad data!")

                finally:
                    return False

            self.finished()

        return False

