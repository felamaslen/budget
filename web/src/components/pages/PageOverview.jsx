/**
 * Overview page component
 */

import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import classNames from 'classnames';
import Media from 'react-media';
import {
    mediaQueries,
    GRAPH_WIDTH, GRAPH_HEIGHT, GRAPH_SPEND_CATEGORIES,
    OVERVIEW_COLUMNS
} from '../../misc/const';
import { GRAPH_SPEND_NUM_ITEMS } from '../../misc/config';
import { formatCurrency } from '../../misc/format';
import getEditable from '../Editable';
import { GraphBalance } from '../graphs/GraphBalance';
import { GraphSpend } from '../graphs/GraphSpend';

export class PageOverview extends PureControllerView {
    format(value, abbreviate) {
        return formatCurrency(value, { abbreviate, precision: 1 });
    }
    renderHeader() {
        const header = OVERVIEW_COLUMNS.map((column, key) => {
            const className = [
                'col',
                column[0]
            ].join(' ');

            return <div className={className} key={key}>
                <span className="text">{column[1]}</span>
            </div>;
        });

        return <div className="row header">{header}</div>;
    }
    renderCells(row, rowKey) {
        return row.get('cells')
            .map((cell, cellKey) => {
                const style = {};
                if (cell.get('rgb')) {
                    style.backgroundColor = `rgb(${cell.get('rgb').join(',')})`;
                }

                const cellClasses = { col: true };
                cellClasses[cell.getIn(['column', 0])] = true;
                let span = null;
                if (cell.get('editable')) {
                    // editable balance column
                    const active = this.props.edit.get('row') === rowKey &&
                        this.props.edit.get('col') === 0;

                    span = getEditable(
                        this.props.dispatcher, rowKey, 0, null, 'cost', cell.get('value'), 0, active
                    );

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
    }
    renderRows(numToSkip) {
        const rows = this.props.data.get('rows')
            .slice(numToSkip)
            .map((row, key) => {
                const rowKey = key + numToSkip;

                const rowClasses = classNames({
                    row: true,
                    past: Boolean(row.get('past')),
                    active: Boolean(row.get('active')),
                    future: Boolean(row.get('future'))
                });

                const cells = this.renderCells(row, rowKey);

                return <div key={key} className={rowClasses}>{cells}</div>;
            });

        return <div>{rows}</div>;
    }
    renderTable() {
        const mobileRows = render => {
            if (render) {
                return this.renderRows(19);
            }

            return null;
        };

        const desktopRows = render => {
            if (render) {
                return this.renderRows(0);
            }

            return null;
        }

        return (
            <div className="table-flex table-insert table-overview noselect">
                {this.renderHeader()}
                <Media query={mediaQueries.mobile}>{mobileRows}</Media>
                <Media query={mediaQueries.desktop}>{desktopRows}</Media>
            </div>
        );
    }
    renderGraphBalance(render) {
        if (!render) {
            return null;
        }

        const graphWidth = Math.min(GRAPH_WIDTH, window.innerWidth);

        return (
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
        );

    }
    renderGraphSpend(render) {
        if (!render) {
            return null;
        }

        const graphSpendData = list(GRAPH_SPEND_CATEGORIES).map(item => {
            return this.props.data.getIn(['data', 'cost', item.name]).slice(-GRAPH_SPEND_NUM_ITEMS);
        });

        return (
            <GraphSpend dispatcher={this.props.dispatcher}
                width={GRAPH_WIDTH} height={GRAPH_HEIGHT}
                name="spend"
                categories={list(GRAPH_SPEND_CATEGORIES)}
                data={graphSpendData}
                income={this.props.data.getIn(['data', 'cost', 'income']).slice(-GRAPH_SPEND_NUM_ITEMS)}
                yearMonths={this.props.data.getIn(['data', 'yearMonths']).slice(-GRAPH_SPEND_NUM_ITEMS)}
                currentYearMonth={this.props.data.getIn(['data', 'currentYearMonth'])} />
        );
    }
    renderGraphs() {
        return (
            <div className="graph-container-outer">
                <Media query={mediaQueries.mobile}>
                    {matches => this.renderGraphBalance(matches)}
                </Media>
                <Media query={mediaQueries.desktop}>
                    {matches => this.renderGraphBalance(matches)}
                </Media>
                <Media query={mediaQueries.desktop}>
                    {matches => this.renderGraphSpend(matches)}
                </Media>
            </div>
        );
    }
    render() {
        return (
            <div>
                {this.renderTable()}
                {this.renderGraphs()}
            </div>
        );
    }
}

PageOverview.propTypes = {
    data: PropTypes.instanceOf(map),
    edit: PropTypes.instanceOf(map),
    showAll: PropTypes.bool
};

