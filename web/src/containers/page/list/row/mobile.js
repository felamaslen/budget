import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { LIST_COLS_MOBILE } from '../../../../constants/data';
import { formatCurrency } from '../../../../helpers/format';
import { aMobileEditDialogOpened } from '../../../../actions/form.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Editable from '../../../editable';

const renderItems = ({ page, colKeys, row, id }) => cols => cols.map((column, key) => {
    const colKey = colKeys[key];

    const value = row.getIn(['cols', colKey]);

    const editableProps = {
        page,
        row: id,
        col: colKey,
        item: column,
        value,
        staticEdit: true
    };

    return <span key={key} className={column}>
        <Editable {...editableProps} />
    </span>;
});

function renderGainInfoMobile(cost, gain) {
    if (!gain) {
        return null;
    }

    const formatOptions = {
        abbreviate: true,
        precision: 1
    };

    const costValue = <span className="cost-value">
        {formatCurrency(cost, formatOptions)}
    </span>;

    const value = cost
        ? formatCurrency(gain.get('value'), formatOptions)
        : '\u2013';

    const actualValue = <span className="actual-value">{value}</span>;

    return <span className="cost">
        {costValue}
        {actualValue}
    </span>;
}

export function ListRowMobile({ onEdit, ...props }) {
    const { page, id } = props;

    const onClick = () => onEdit(id);

    if (page === 'funds') {
        const items = renderItems(props)(['date', 'item']);

        const { colKeys, row } = props;

        const gainInfo = renderGainInfoMobile(row.getIn(['cols', colKeys[2]]), row.get('gain'));

        return <li onClick={onClick}>{items}{gainInfo}</li>;
    }

    const items = renderItems(props)(LIST_COLS_MOBILE);

    return <li onClick={onClick}>{items}</li>;
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    colKeys: PropTypes.array.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    id: PropTypes.number.isRequired,
    onEdit: PropTypes.func.isRequired
};

const mapStateToProps = (state, { page, id }) => ({
    row: state.getIn(['pages', page, 'rows', id])
});

const mapDispatchToProps = (dispatch, { page }) => ({
    onEdit: id => dispatch(aMobileEditDialogOpened(page, id))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListRowMobile);

