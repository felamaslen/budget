/**
 * Process list data
 */

import { List as list, Map as map } from 'immutable';
import { YMD } from '../../misc/date';
import { LIST_COLS_SHORT, LIST_COLS_PAGES } from '../../misc/const';

export const processPageDataList = (raw, pageIndex) => {
  const numRows = raw.data.length;
  const numCols = LIST_COLS_PAGES[pageIndex].length;
  const total = raw.total;

  const data = map({
    numRows,
    numCols,
    total
  });

  const rows = list(raw.data.map(item => {
    return map({
      id: item.I,
      cols: list(LIST_COLS_SHORT[pageIndex].map(col => {
        if (col === 'd') {
          return new YMD(item[col]);
        }
        return item[col];
      }))
    });
  }));

  return map({ data, rows });
};

