import React from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import { OVERVIEW_COLUMNS } from '~client/constants/data';

export default function OverviewTableHeader() {
    const header = OVERVIEW_COLUMNS.map(([columnClass, columnName, link = null]) => (
        <div className={classNames('col', columnClass)} key={columnName}>
            {link && <NavLink className="text" to={link}>{columnName}</NavLink>}
            {!link && <span className="text">{columnName}</span>}
        </div>
    ));

    return <div className="row header">{header}</div>;
}

