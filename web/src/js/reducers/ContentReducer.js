/*
 * Carries out actions for the content component
 */

import { EF_CONTENT_REQUESTED } from '../constants/effects';
import buildMessage from '../messageBuilder';
import { PAGES, LIST_PAGES } from '../misc/const';
import {
  getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data.jsx';

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
    const page = processPageDataList(data, pageIndex);
    const sortedRows = sortRowsByDate(page.get('rows'), pageIndex);
    const weeklyData = addWeeklyAverages(page.get('data'), sortedRows, pageIndex);
    return page.set('rows', sortedRows).set('data', weeklyData);
  }

  return null;
};

export const rHandleContentResponse = (reduction, output) => {
  return reduction.setIn(['appState', 'pagesLoaded', output.page], true)
  .setIn(['appState', 'pagesRaw', output.page], output.response.data.data)
  .setIn(['appState', 'pages', output.page], processPageData(output.page, output.response.data.data))
  .setIn(['appState', 'edit', 'active'], getNullEditable(output.page))
  .setIn(['appState', 'edit', 'add'], getAddDefaultValues(output.page));
};

