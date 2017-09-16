/**
 * Overview page component
 */

import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import classNames from 'classnames';
import {
    GRAPH_WIDTH, GRAPH_HEIGHT, GRAPH_SPEND_CATEGORIES,
    OVERVIEW_COLUMNS
} from '../../misc/const';
import { GRAPH_SPEND_NUM_ITEMS } from '../../misc/config';
import { formatCurrency } from '../../misc/format';
import { getEditable } from '../Editable/getEditable';
import { GraphBalance } from '../graphs/GraphBalance';
import { GraphSpend } from '../graphs/GraphSpend';

export class PageOverview extends PureControllerView {
    format(value, abbreviate) {
        return formatCurrency(value, { abbreviate, precision: 1 });
    }
    render() {
        const rows = this.props.data.get('rows').map((row, key) => {
            const rowClasses = classNames({
                row: true,
                past: Boolean(row.get('past')),
                active: Boolean(row.get('active')),
                future: Boolean(row.get('future'))
            });

            const cells = row.get('cells').map((cell, cellKey) => {
                const style = {};
                if (cell.get('rgb')) {
                    style.backgroundColor = `rgb(${cell.get('rgb').join(',')})`;
                }

                const cellClasses = { col: true };
                cellClasses[cell.get('column')[1].toLowerCase()] = true;
                let span = null;
                if (cell.get('editable')) {
                    // editable balance column
                    const active = this.props.edit.get('row') === key && this.props.edit.get('col') === 0;
                    span = getEditable(this.props.dispatcher, key, 0, null, 'cost', cell.get('value'), 0, active);

                    cellClasses['editable-outer'] = true;
                    cellClasses.editing = active;
                }
                else {
                    const value = cellKey > 0
                        ? this.format(cell.get('value'), true)
                        : cell.get('value');

                    span = <span className="text">{value}</span>;
                }

                return (
                    <div key={cellKey} className={classNames(cellClasses)} style={style}>
                        {span}
                    </div>
                );
            });

            return <div key={key} className={rowClasses}>{cells}</div>;
        });

        const graphSpendData = list(GRAPH_SPEND_CATEGORIES).map(item => {
            return this.props.data.getIn(['data', 'cost', item.name]).slice(-GRAPH_SPEND_NUM_ITEMS);
        });

        const overviewHead = OVERVIEW_COLUMNS.map((column, key) => {
            const className = [
                'col',
                column[1].toLowerCase()
            ].join(' ');

            return <div className={className} key={key}>
                <span className="text">{column[1]}</span>
            </div>;
        });

        const graphWidth = Math.min(GRAPH_WIDTH, window.innerWidth);

        return (
            <div>
                <div className="table-flex table-insert table-overview noselect">
                    <div className="row header">
                        {overviewHead}
                    </div>
                    {rows}
                </div>
                <div className="graph-container-outer">
                    <GraphBalance dispatcher={this.props.dispatcher}
                        width={graphWidth} height={GRAPH_HEIGHT}
                        name="balance"
                        startYearMonth={this.props.data.getIn(['data', 'startYearMonth'])}
                        currentYearMonth={this.props.data.getIn(['data', 'currentYearMonth'])}
                        yearMonths={this.props.data.getIn(['data', 'yearMonths'])}
                        showAll={this.props.showAll}
                        balance={this.props.data.getIn(['data', 'cost', 'balanceWithPredicted'])}
                        balanceOld={this.props.data.getIn(['data', 'cost', 'old'])}
                        funds={this.props.data.getIn(['data', 'cost', 'funds'])}
                        fundsOld={this.props.data.getIn(['data', 'cost', 'fundsOld'])} />
                    <GraphSpend dispatcher={this.props.dispatcher}
                        width={graphWidth} height={GRAPH_HEIGHT}
                        name="spend"
                        categories={list(GRAPH_SPEND_CATEGORIES)}
                        data={graphSpendData}
                        income={this.props.data.getIn(['data', 'cost', 'income']).slice(-GRAPH_SPEND_NUM_ITEMS)}
                        yearMonths={this.props.data.getIn(['data', 'yearMonths']).slice(-GRAPH_SPEND_NUM_ITEMS)}
                        currentYearMonth={this.props.data.getIn(['data', 'currentYearMonth'])} />
                </div>
            </div>
        );
    }
}

PageOverview.propTypes = {
    data: PropTypes.instanceOf(map),
    edit: PropTypes.instanceOf(map),
    showAll: PropTypes.bool
};

