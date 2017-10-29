/**
 * Overview page component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aKeyPressed } from '../../actions/AppActions';
import { aContentRequested } from '../../actions/ContentActions';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Media from 'react-media';

import Page from '../Page';

import { mediaQueries, PAGES, OVERVIEW_COLUMNS } from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import getEditable from '../Editable';
import GraphBalance from '../graphs/GraphBalance';
import GraphSpend from '../graphs/GraphSpend';

const pageIndex = PAGES.indexOf('overview');

export class PageOverview extends Page {
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

            return <Editable pageIndex={pageIndex} />;
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
        const rows = this.props.rows
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

        return <div className="table-flex table-insert table-overview noselect">
            {this.renderHeader()}
            <Media query={mediaQueries.mobile}>{mobileRows}</Media>
            <Media query={mediaQueries.desktop}>{desktopRows}</Media>
        </div>;
    }
    renderGraphBalance(render) {
        if (!render) {
            return null;
        }

        return <GraphBalance name="balance" />;
    }
    renderGraphSpend(render) {
        if (!render) {
            return null;
        }

        return <GraphSpend name="spend" />;
    }
    renderGraphs() {
        return <div className="graph-container-outer">
            <Media query={mediaQueries.mobile}>
                {matches => this.renderGraphBalance(matches)}
            </Media>
            <Media query={mediaQueries.desktop}>
                {matches => this.renderGraphBalance(matches)}
            </Media>
            <Media query={mediaQueries.desktop}>
                {matches => this.renderGraphSpend(matches)}
            </Media>
        </div>;
    }
    render() {
        if (!this.props.loaded) {
            return null;
        }

        return <div className="page-overview">
            {this.renderTable()}
            {this.renderGraphs()}
        </div>;
    }
}

PageOverview.propTypes = {
    rows: PropTypes.instanceOf(list),
    loaded: PropTypes.bool.isRequired,
    editRow: PropTypes.number,
    editCol: PropTypes.number,
    handleKeyPress: PropTypes.func.isRequired,
    loadContent: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    pageIndex,
    rows: state.getIn(['pages', pageIndex, 'rows']),
    loaded: Boolean(state.getIn(['pagesLoaded', pageIndex])),
    editRow: state.getIn(['edit', 'row']),
    editCol: state.getIn(['edit', 'col'])
});

const mapDispatchToProps = dispatch => ({
    loadContent: req => dispatch(aContentRequested(req)),
    handleKeyPress: event => dispatch(aKeyPressed(event))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageOverview);

