/*
 * Carries out actions for the graph components
 */

import { List as list } from 'immutable';
import { PAGES, GRAPH_ZOOM_MAX, GRAPH_ZOOM_SPEED } from '../misc/const';
import { getFormattedHistory, zoomFundLines } from './data/funds';

const pageIndexFunds = PAGES.indexOf('funds');

export const rToggleShowAll = reduction => {
  return reduction.setIn(
    ['appState', 'other', 'showAllBalanceGraph'],
    !reduction.getIn(['appState', 'other', 'showAllBalanceGraph']));
};

export const rToggleFundItemGraph = (reduction, key) => {
  return reduction.setIn(
    ['appState', 'pages', pageIndexFunds, 'rows', key, 'historyPopout'],
    !reduction.getIn(['appState', 'pages', pageIndexFunds, 'rows', key, 'historyPopout'])
  );
};

export const rToggleFundsGraphMode = reduction => {
  const newMode = (reduction.getIn(['appState', 'other', 'graphFunds', 'mode']) + 1) % 3;
  return getFormattedHistory(
    reduction.setIn(['appState', 'other', 'graphFunds', 'mode'], newMode),
    pageIndexFunds,
    reduction.getIn(['appState', 'pages', pageIndexFunds, 'history'])
  );
};

const numFundPointsVisible = (lines, minX, maxX) => {
  return lines.reduce((last, line) => {
    return Math.max(last, line.last().filter(item => {
      const xValue = item.first();
      return xValue >= minX && xValue <= maxX;
    }).size);
  }, 0);
};

export const rZoomFundsGraph = (reduction, obj) => {
  // direction: in is negative, out is positive
  const range = reduction.getIn(['appState', 'other', 'graphFunds', 'range']);
  const zoom = reduction.getIn(['appState', 'other', 'graphFunds', 'zoom']);
  const lines = reduction.getIn(['appState', 'pages', pageIndexFunds, 'lines']);

  if (obj.direction < 0 && numFundPointsVisible(lines, zoom.get(0), zoom.get(1)) < 4) {
    return reduction;
  }
  const newRangeWidth = Math.min(range.last() - range.first(), Math.max(
    (range.last() - range.first()) * GRAPH_ZOOM_MAX,
    (zoom.last() - zoom.first()) * (1 + GRAPH_ZOOM_SPEED * obj.direction)
  ));

  let newMinXTarget = obj.position - newRangeWidth / 2;
  let newMaxXTarget = obj.position + newRangeWidth / 2;
  if (newMinXTarget < range.first()) {
    newMaxXTarget += range.first() - newMinXTarget;
    newMinXTarget = range.first();
  }
  else if (newMaxXTarget > range.last()) {
    newMinXTarget -= newMaxXTarget - range.last();
    newMaxXTarget = range.last();
  }

  const newMinX = Math.max(range.first(), Math.round(newMinXTarget));
  const newMaxX = Math.min(range.last(), Math.round(newMaxXTarget));
  const newZoom = list([newMinX, newMaxX]);

  const newReduction = reduction
  .setIn(['appState', 'other', 'graphFunds', 'zoom'], newZoom)
  .setIn(['appState', 'other', 'graphFunds', 'hlPoint'], null);

  return newReduction.setIn(
    ['appState', 'pages', pageIndexFunds, 'lines'],
    zoomFundLines(newReduction.getIn(['appState', 'pages', pageIndexFunds, 'linesAll']), newReduction)
  );
};

export const rHoverFundsGraph = (reduction, position) => {
  if (!position) {
    return reduction.setIn(['appState', 'other', 'graphFunds', 'hlPoint'], null);
  }

  const lines = reduction.getIn(['appState', 'pages', pageIndexFunds, 'lines']);
  const closest = lines.reduce((last, line, lineKey) => {
    return line.last().reduce((thisLast, point, pointKey) => {
      const pointDistance = Math.sqrt(
        Math.pow(point.first() - position.valX, 2) + Math.pow(point.last() - position.valY, 2)
      );
      if (pointDistance < thisLast[0]) {
        return [pointDistance, lineKey, pointKey];
      }
      return thisLast;
    }, last);
  }, [Infinity, null]);

  const color = lines.getIn([closest[1], 0]);
  const hlPoint = lines.getIn([closest[1], 1, closest[2]]);
  return reduction.setIn(
    ['appState', 'other', 'graphFunds', 'hlPoint'], hlPoint ? hlPoint.push(color) : null);
};

