import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getEditable from '../../../editable';

export default function Column({ page, id, row, colName, colKey, active }) {
    const value = row.getIn(['cols', colKey]);

    const Editable = getEditable({
        row: id,
        col: colKey,
        item: colName,
        value
    });

    const spanClasses = classNames(colName, { active });

    return <span key={colKey} className={spanClasses}>
        <Editable page={page} />
    </span>;

}

Column.propTypes = {
    page: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    colName: PropTypes.string.isRequired,
    colKey: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired
};

