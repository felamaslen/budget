import React from 'react';
import classNames from 'classnames';
import { OVERVIEW_COLUMNS } from '../../../../misc/const';

export default function OverviewTableHeader() {
    const header = OVERVIEW_COLUMNS.map(([columnClass, columnName], key) => {
        const className = classNames('col', columnClass);

        return <div className={className} key={key}>
            <span className="text">{columnName}</span>
        </div>;
    });

    return <div className="row header">{header}</div>;
}

