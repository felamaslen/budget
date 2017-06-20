/**
 * Funds page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PageList } from './PageList';
import {
  GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_HEIGHT,
  GRAPH_FUND_ITEM_WIDTH_LARGE, GRAPH_FUND_ITEM_HEIGHT_LARGE,
  GRAPH_FUNDS_WIDTH, GRAPH_FUNDS_HEIGHT
} from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import { GraphFundItem } from '../graphs/GraphFundItem';
import { GraphFunds } from '../graphs/GraphFunds';

export class PageFunds extends PageList {
  renderListExtra(row, rowKey) {
    const name = row.getIn(['cols', 1]).toLowerCase().replace(/\W+/g, '-');
    const popout = row.get('historyPopout');
    const width = popout ? GRAPH_FUND_ITEM_WIDTH_LARGE : GRAPH_FUND_ITEM_WIDTH;
    const height = popout ? GRAPH_FUND_ITEM_HEIGHT_LARGE : GRAPH_FUND_ITEM_HEIGHT;

    const formatOptions = { brackets: true, abbreviate: true, precision: 1, noPence: true };
    const formatOptionsPct = { brackets: true, precision: 2, noSymbol: true, suffix: '%' };

    const gain = row.get('gain');

    const gainStyle = {
      backgroundColor: gain.color
    };
    const gainOuterClasses = classNames({
      text: true,
      profit: gain.pct >= 0,
      loss: gain.pct < 0
    });
    const gainClasses = classNames({
      gain: true,
      profit: gain.pct >= 0,
      loss: gain.pct < 0
    });
    const gainAbsClasses = classNames({
      'gain-abs': true,
      profit: gain.abs >= 0,
      loss: gain.abs < 0
    });
    const dayGainClasses = classNames({
      'day-gain': true,
      profit: gain.dayPct >= 0,
      loss: gain.dayPct < 0
    });
    const dayGainAbsClasses = classNames({
      'day-gain-abs': true,
      profit: gain.dayAbs >= 0,
      loss: gain.dayAbs < 0
    });

    return (
      <span>
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
        <span className='gain'>
          <span className={gainOuterClasses} style={gainStyle}>
            <span className='value'>
              {formatCurrency(gain.value, formatOptions)}
            </span>
            <span className={gainAbsClasses}>
              {formatCurrency(gain.abs, formatOptions)}
            </span>
            <span className={dayGainAbsClasses}>
              {formatCurrency(gain.dayAbs, formatOptions)}
            </span>
            <span className={gainClasses}>
              {formatCurrency(100 * gain.pct, formatOptionsPct)}
            </span>
            <span className={dayGainClasses}>
              {formatCurrency(100 * gain.dayPct, formatOptionsPct)}
            </span>
          </span>
        </span>
      </span>
    );
  }
  afterList() {
    // render graphs here
    return (
      <div className='graph-container-outer'>
        <GraphFunds dispatcher={this.props.dispatcher}
          name='fund-history'
          width={GRAPH_FUNDS_WIDTH} height={GRAPH_FUNDS_HEIGHT}
          history={this.props.data.get('history')}
          lines={this.props.data.get('lines')}
          funds={this.props.data.get('rows')}
          mode={this.props.graphFundsMode}
          showOverall={this.props.showOverall}
        />
      </div>
    );
  }
}

PageFunds.propTypes = {
  graphFundsMode: PropTypes.number,
  showOverall: PropTypes.bool
};

