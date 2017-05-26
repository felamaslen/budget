/*
 * Carries out actions for the content component
 */

import { PAGES } from '../misc/const';
import { EF_CONTENT_REQUESTED } from '../constants/effects';
import buildMessage from '../messageBuilder';

import processPageDataOverview from './data/overview';

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
 * @param {integer} page: page index
 * @param {object} data: response data
 * @returns {map}: page data for view
 */
const processPageData = (page, data) => {
  if (page === 0) {
    return processPageDataOverview(data);
  }
  return null;
};

export const rHandleContentResponse = (reduction, output) => {
  return reduction.setIn(['appState', 'pagesLoaded', output.page], true)
  .setIn(['appState', 'pagesRaw', output.page], output.response.data.data)
  .setIn(['appState', 'pages', output.page], processPageData(output.page, output.response.data.data));
};

