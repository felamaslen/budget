import { Map as map } from 'immutable';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Editable from '../../../editable';
import { formatCurrency } from '../../../../helpers/format';

export default class OverviewTableCellInner extends Component {
    constructor(props) {
        super(props);

        this.state = { hover: false };
    }
    render() {
        const { cell, cellKey, rowKey, editable } = this.props;

        if (editable) {
            // editable balance column
            const props = {
                page: 'overview',
                row: rowKey,
                col: 0,
                id: null,
                item: 'cost',
                value: cell.get('value')
            };

            return <Editable {...props} />;
        }

        const onMouseOver = () => this.setState({ hover: true });
        const onMouseOut = () => this.setState({ hover: false });

        const value = cellKey > 0
            ? formatCurrency(cell.get('value'), {
                abbreviate: !this.state.hover,
                precision: 1,
                brackets: true
            })
            : cell.get('value');

        return (
            <span className="text"
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}>
                {value}
            </span>
        );
    }
}

OverviewTableCellInner.propTypes = {
    cell: PropTypes.instanceOf(map).isRequired,
    cellKey: PropTypes.number.isRequired,
    rowKey: PropTypes.number.isRequired,
    editable: PropTypes.bool.isRequired
};

