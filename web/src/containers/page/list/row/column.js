import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getEditable from '../../../editable';

export default function Column({ pageIndex, id, row, colName, colKey, active, noSuggestions }) {
    const value = row.getIn(['cols', colKey]);

    const Editable = getEditable({
        row: id,
        col: colKey,
        item: colName,
        value
    });

    const spanClasses = classNames({
        [colName]: true,
        active
    });

    return <span key={colKey} className={spanClasses}>
        <Editable noSuggestions={noSuggestions} pageIndex={pageIndex} />
    </span>;

}

Column.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    colName: PropTypes.string.isRequired,
    colKey: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    noSuggestions: PropTypes.bool.isRequired
};

