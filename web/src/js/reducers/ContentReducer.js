/*
 * Carries out actions for the content component
 */

import { PAGES } from '../misc/const';
import { EF_CONTENT_REQUESTED } from '../constants/effects';
import buildMessage from '../messageBuilder';

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

export const rHandleContentResponse = (reduction, output) => {
  return reduction.setIn(['appState', 'pagesLoaded', output.page], true)
  .setIn(['appState', 'pages', output.page], output.response.data.data);
};

