/**
 * Funds page component
 */

import React from 'react';
import { PageList } from './PageList';
import {
  GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_HEIGHT,
  GRAPH_FUND_ITEM_WIDTH_LARGE, GRAPH_FUND_ITEM_HEIGHT_LARGE
} from '../../misc/const';
import { GraphFundItem } from '../graphs/GraphFundItem';

export class PageFunds extends PageList {
  renderListExtra(row, rowKey) {
    const name = row.getIn(['cols', 1]).toLowerCase().replace(/\W+/g, '-');
    const popout = row.get('historyPopout');
    const width = popout ? GRAPH_FUND_ITEM_WIDTH_LARGE : GRAPH_FUND_ITEM_WIDTH;
    const height = popout ? GRAPH_FUND_ITEM_HEIGHT_LARGE : GRAPH_FUND_ITEM_HEIGHT;

    return (
      <span className='fund-graph'>
        <div className='fund-graph-cont'>
          <GraphFundItem dispatcher={this.props.dispatcher}
            width={width}
            height={height}
            name={name}
            data={row.get('history')}
            popout={row.get('historyPopout')}
            rowKey={rowKey}
          />
        </div>
      </span>
    );
  }
}
