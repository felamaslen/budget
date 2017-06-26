/*
 * Carries out actions for the content component
 */

import { EF_CONTENT_REQUESTED } from '../constants/effects';
import buildMessage from '../messageBuilder';
import {
  PAGES, LIST_PAGES, ANALYSIS_PERIODS, ANALYSIS_GROUPINGS, GRAPH_FUNDS_PERIODS
} from '../misc/const';
import {
  getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data';

import processPageDataOverview from './data/overview';
import { processPageDataList, processPageDataFunds } from './data/list';
import { processPageDataAnalysis } from './data/analysis';

export const rLoadContent = (reduction, pageIndex) => {
  if (!reduction.getIn(['appState', 'pagesLoaded', pageIndex])) {
    const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
    const pageName = PAGES[pageIndex];

    const reqObj = { pageIndex, pageName, apiKey };

    switch (PAGES[pageIndex]) {
    case 'analysis':
      const period = ANALYSIS_PERIODS[reduction.getIn(['appState', 'other', 'analysis', 'period'])];
      const grouping = ANALYSIS_GROUPINGS[reduction.getIn(['appState', 'other', 'analysis', 'grouping'])];
      const timeIndex = reduction.getIn(['appState', 'other', 'analysis', 'timeIndex']);

      reqObj.dataReq = [period, grouping, timeIndex];
      break;

    case 'funds':
      reqObj.urlParam = [
        { name: 'history', value: 'true' },
        { name: 'period', value: GRAPH_FUNDS_PERIODS[0][0] }
      ];
      break;
    }

    return reduction.set('effects', reduction.get('effects').push(
      buildMessage(EF_CONTENT_REQUESTED, reqObj)
    ));
  }
  return reduction;
};

/**
 * Processes response data into output fit for consumption by the view
 * @param {Record} reduction: app state
 * @param {integer} pageIndex: page index
 * @param {object} data: response data
 * @returns {map}: page data for view
 */
const processPageData = (reduction, pageIndex, data) => {
  if (PAGES[pageIndex] === 'overview') {
    // overview
    return processPageDataOverview(reduction, pageIndex, data);
  }

  if (PAGES[pageIndex] === 'analysis') {
    // analysis
    return processPageDataAnalysis(reduction, pageIndex, data);
  }

  if (PAGES[pageIndex] === 'funds') {
    // funds
    return processPageDataFunds(reduction, pageIndex, data);
  }

  else if (LIST_PAGES.indexOf(pageIndex) > -1) {
    const newReduction = processPageDataList(reduction, pageIndex, data);
    const sortedRows = sortRowsByDate(
      newReduction.getIn(['appState', 'pages', pageIndex, 'rows']), pageIndex);
    const weeklyData = addWeeklyAverages(
      newReduction.getIn(['appState', 'pages', pageIndex, 'data']), sortedRows, pageIndex);

    return newReduction
    .setIn(['appState', 'pages', pageIndex, 'rows'], sortedRows)
    .setIn(['appState', 'pages', pageIndex, 'data'], weeklyData);
  }

  return reduction;
};

export const rHandleContentResponse = (reduction, output) => {
  return processPageData(
    reduction
    .setIn(['appState', 'pagesLoaded', output.pageIndex], true)
    .setIn(['appState', 'pagesRaw', output.pageIndex], output.response.data.data),
    output.pageIndex,
    output.response.data.data
  )
  .setIn(['appState', 'edit', 'active'], getNullEditable(output.pageIndex))
  .setIn(['appState', 'edit', 'add'], getAddDefaultValues(output.pageIndex));
};

