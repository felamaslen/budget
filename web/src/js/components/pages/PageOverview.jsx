/**
 * Overview page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { Map as map } from 'immutable';
import classNames from 'classnames';
import {
  GRAPH_WIDTH, GRAPH_HEIGHT, GRAPH_BALANCE_CATEGORIES,
  OVERVIEW_COLUMNS
} from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import { getEditable } from '../Editable/getEditable.jsx';
import { GraphBalance } from '../graphs/GraphBalance.jsx';

export class PageOverview extends PureControllerView {
  format(value, abbreviate) {
    return formatCurrency(value, { abbreviate, precision: 1 });
  }
  render() {
    const rows = this.props.data.get('rows').map((row, key) => {
      const rowClasses = classNames({
        past: !!row.get('past'),
        active: !!row.get('active'),
        future: !!row.get('future')
      });

      const cells = row.get('cells').map((cell, cellKey) => {
        const style = {};
        if (cell.get('rgb')) {
          style.backgroundColor = `rgb(${cell.get('rgb').join(',')})`;
        }

        const cellClasses = {};
        cellClasses[cell.get('column').toLowerCase()] = true;
        let span;
        if (cell.get('editable')) {
          // editable balance column
          const active = this.props.edit.get('row') === key && this.props.edit.get('col') === 0;
          span = getEditable(this.props.dispatcher, key, 0, null, 'cost', cell.get('value'), 0, active);

          cellClasses['editable-outer'] = true;
          cellClasses.editing = active;
        }
        else {
          const value = cellKey > 0 ? this.format(cell.get('value'), true) : cell.get('value');
          span = <span className='text'>{value}</span>;
        }

        return (
          <td key={cellKey} className={classNames(cellClasses)} style={style}>
            {span}
          </td>
        );
      });

      return <tr key={key} className={rowClasses}>{cells}</tr>;
    });

    return (
      <div>
        <table className='table-insert table-overview noselect'>
          <thead>
            <tr>
              {OVERVIEW_COLUMNS.map((column, key) => <th key={key}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        <div className='graph-container-outer'>
          <GraphBalance dispatcher={this.props.dispatcher}
            width={GRAPH_WIDTH} height={GRAPH_HEIGHT}
            name='balance'
            startYearMonth={this.props.data.getIn(['data', 'startYearMonth'])}
            currentYearMonth={this.props.data.getIn(['data', 'currentYearMonth'])}
            yearMonths={this.props.data.getIn(['data', 'yearMonths'])}
            categories={GRAPH_BALANCE_CATEGORIES}
            balance={this.props.data.getIn(['data', 'cost', 'balanceWithPredicted'])}
            balanceOld={this.props.data.getIn(['data', 'cost', 'old'])}
            funds={this.props.data.getIn(['data', 'cost', 'funds'])}
            fundsOld={this.props.data.getIn(['data', 'cost', 'fundsOld'])} />
        </div>
      </div>
    );
  }
}

PageOverview.propTypes = {
  data: PropTypes.instanceOf(map),
  edit: PropTypes.instanceOf(map)
};

