import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Editable from '../../containers/Editable';

export default function ListRowCell({ page, id, row, colName, colKey, active }) {
    const spanClasses = classNames(colName, { active });

    const props = {
        page,
        row: id,
        col: colKey,
        item: colName,
        value: row.getIn(['cols', colKey])
    };

    return <span key={colKey} className={spanClasses}>
        <Editable {...props} />
    </span>;

}

ListRowCell.propTypes = {
    page: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    colName: PropTypes.string.isRequired,
    colKey: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired
};

