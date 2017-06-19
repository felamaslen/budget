/*
 * Carries out actions for the content component
 */

import { EF_CONTENT_REQUESTED } from '../constants/effects';
import buildMessage from '../messageBuilder';
import { PAGES, LIST_PAGES } from '../misc/const';
import {
  getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data';

import processPageDataOverview from './data/overview';
import { processPageDataList, processPageDataFunds } from './data/list';

export const rLoadContent = (reduction, pageIndex) => {
  if (!reduction.getIn(['appState', 'pagesLoaded', pageIndex])) {
    const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
    const pageName = PAGES[pageIndex];
    const reqObj = { pageIndex, pageName, apiKey };

    if (PAGES[pageIndex] === 'funds') {
      reqObj.urlParam = [
        { name: 'history', value: 'true' },
        { name: 'period', value: 'year1' }
      ];
    }

    return reduction.set('effects', reduction.get('effects').push(
      buildMessage(EF_CONTENT_REQUESTED, reqObj)
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

  if (PAGES[pageIndex] === 'funds') {
    // funds
    return processPageDataFunds(data, pageIndex);
  }

  else if (LIST_PAGES.indexOf(pageIndex) > -1) {
    const page = processPageDataList(data, pageIndex);
    const sortedRows = sortRowsByDate(page.get('rows'), pageIndex);
    const weeklyData = addWeeklyAverages(page.get('data'), sortedRows, pageIndex);
    return page.set('rows', sortedRows).set('data', weeklyData);
  }

  return null;
};

export const rHandleContentResponse = (reduction, output) => {
  return reduction.setIn(['appState', 'pagesLoaded', output.pageIndex], true)
  .setIn(['appState', 'pagesRaw', output.pageIndex], output.response.data.data)
  .setIn(
    ['appState', 'pages', output.pageIndex],
    processPageData(output.pageIndex, output.response.data.data)
  )
  .setIn(['appState', 'edit', 'active'], getNullEditable(output.pageIndex))
  .setIn(['appState', 'edit', 'add'], getAddDefaultValues(output.pageIndex));
};

