/**
 * Overview page component
 */

import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';

import { aContentRequested } from '../../actions/ContentActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Media from 'react-media';

import {
    mediaQueries,
    PAGES, GRAPH_WIDTH, GRAPH_HEIGHT, GRAPH_SPEND_CATEGORIES,
    OVERVIEW_COLUMNS
} from '../../misc/const';
import { GRAPH_SPEND_NUM_ITEMS } from '../../misc/config';
import { formatCurrency } from '../../misc/format';
import getEditable from '../Editable';
import { GraphBalance } from '../graphs/GraphBalance';
import { GraphSpend } from '../graphs/GraphSpend';

export class PageOverview extends Component {
    componentDidMount() {
        this.props.loadContent({
            apiKey: this.props.apiKey,
            pageIndex: this.props.pageIndex
        });
    }
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
    renderCellInner(cell, cellKey, rowKey, editable) {
        if (editable) {
            // editable balance column
            const Editable = getEditable({
                row: rowKey,
                col: 0,
                id: null,
                item: 'cost',
                value: cell.get('value')
            });

            return <Editable />;
        }

        const value = cellKey > 0
            ? this.format(cell.get('value'), true)
            : cell.get('value');

        return <span className="text">{value}</span>;
    }
    renderCells(row, rowKey) {
        return row.get('cells')
            .map((cell, cellKey) => {
                const style = {};
                if (cell.get('rgb')) {
                    style.backgroundColor = `rgb(${cell.get('rgb').join(',')})`;
                }

                const editable = cell.get('editable');

                const active = this.props.editRow === rowKey &&
                    this.props.editCol === 0;

                const cellClasses = {
                    col: true,
                    [cell.getIn(['column', 0])]: true,
                    'editable-outer': editable,
                    editing: editable && active
                };

                const inner = this.renderCellInner(cell, cellKey, rowKey, editable);

                return <div key={cellKey} className={classNames(cellClasses)} style={style}>
                    {inner}
                </div>;
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

        return <GraphBalance
            width={graphWidth} height={GRAPH_HEIGHT}
            name="balance"
            startYearMonth={this.props.data.getIn(['data', 'startYearMonth'])}
            currentYearMonth={this.props.data.getIn(['data', 'currentYearMonth'])}
            yearMonths={this.props.data.getIn(['data', 'yearMonths'])}
            showAll={this.props.showAll}
            balance={this.props.data.getIn(['data', 'cost', 'balanceWithPredicted'])}
            balanceOld={this.props.data.getIn(['data', 'cost', 'old'])}
            funds={this.props.data.getIn(['data', 'cost', 'funds'])}
            fundsOld={this.props.data.getIn(['data', 'cost', 'fundsOld'])} />;
    }
    renderGraphSpend(render) {
        if (!render) {
            return null;
        }

        const graphSpendData = list(GRAPH_SPEND_CATEGORIES).map(item => {
            return this.props.data.getIn(['data', 'cost', item.name]).slice(-GRAPH_SPEND_NUM_ITEMS);
        });

        return <GraphSpend
            width={GRAPH_WIDTH} height={GRAPH_HEIGHT}
            name="spend"
            categories={list(GRAPH_SPEND_CATEGORIES)}
            data={graphSpendData}
            income={this.props.data.getIn(['data', 'cost', 'income']).slice(-GRAPH_SPEND_NUM_ITEMS)}
            yearMonths={this.props.data.getIn(['data', 'yearMonths']).slice(-GRAPH_SPEND_NUM_ITEMS)}
            currentYearMonth={this.props.data.getIn(['data', 'currentYearMonth'])} />;
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
        if (!this.props.active) {
            return null;
        }

        return <div>
            {this.renderTable()}
            {this.renderGraphs()}
        </div>;
    }
}

PageOverview.propTypes = {
    apiKey: PropTypes.string.isRequired,
    pageIndex: PropTypes.number.isRequired,
    data: PropTypes.instanceOf(map),
    active: PropTypes.bool.isRequired,
    editRow: PropTypes.number,
    editCol: PropTypes.number,
    showAll: PropTypes.bool.isRequired,
    loadContent: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const pageIndex = PAGES.indexOf('overview');

    return {
        pageIndex,
        apiKey: state.getIn(['global', 'user', 'apiKey']),
        data: state.getIn(['global', 'pages', pageIndex]),
        active: Boolean(state.getIn(['global', 'pagesLoaded', pageIndex])),
        editRow: state.getIn(['global', 'edit', 'row']),
        editCol: state.getIn(['global', 'edit', 'col']),
        showAll: state.getIn(['global', 'other', 'showAllBalanceGraph'])
    };
};

const mapDispatchToProps = dispatch => ({
    loadContent: req => dispatch(aContentRequested(req))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageOverview);

