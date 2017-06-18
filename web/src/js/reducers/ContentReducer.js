/*
 * Carries out actions for the content component
 */

import { List as list, Map as map } from 'immutable';
import { EF_CONTENT_REQUESTED } from '../constants/effects';
import buildMessage from '../messageBuilder';
import { PAGES, LIST_PAGES, LIST_COLS_PAGES } from '../misc/const';
import { YMD } from '../misc/date';

import processPageDataOverview from './data/overview';
import { processPageDataList } from './data/list';

export const rLoadContent = (reduction, page) => {
  if (!reduction.getIn(['appState', 'pagesLoaded', page])) {
    const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
    const pageName = PAGES[page];

    return reduction.set('effects', reduction.get('effects').push(
      buildMessage(EF_CONTENT_REQUESTED, { page, pageName, apiKey })
    ));
  }
  return reduction;
};

/**
 * Processes response data into output fit for consumption by the view
 * @param {integer} pageIndex: page index
 * @param {object} data: response data
 * @returns {map}: page data for view
 */
const processPageData = (pageIndex, data) => {
  if (PAGES[pageIndex] === 'overview') {
    // overview
    return processPageDataOverview(data);
  }

  if (LIST_PAGES.indexOf(pageIndex) > -1) {
    return processPageDataList(data, pageIndex);
  }

  return null;
};

const getAddDefaultValues = pageIndex => {
  if (!LIST_COLS_PAGES[pageIndex]) {
    return list([]);
  }
  return list(LIST_COLS_PAGES[pageIndex].map(column => {
    if (column === 'date') {
      return new YMD();
    }
    if (column === 'cost') {
      return 0;
    }
    if (column === 'item' || column === 'category' || column === 'shop' ||
      column === 'holiday' || column === 'society') {
      return '';
    }
    return null;
  }));
};

export const rHandleContentResponse = (reduction, output) => {
  const pageIsList = LIST_PAGES.indexOf(output.page) > -1;
  const editing = map({
    row: pageIsList ? -1 : 0,
    col: -1,
    page: null,
    item: null,
    value: null,
    originalValue: null
  });

  return reduction.setIn(['appState', 'pagesLoaded', output.page], true)
  .setIn(['appState', 'pagesRaw', output.page], output.response.data.data)
  .setIn(['appState', 'pages', output.page], processPageData(output.page, output.response.data.data))
  .setIn(['appState', 'edit', 'active'], editing)
  .setIn(['appState', 'edit', 'add'], getAddDefaultValues(output.page));
};

