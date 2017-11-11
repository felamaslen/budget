import React from 'react';

import { OVERVIEW_COLUMNS } from '../../../../misc/const';

export default function OverviewTableHeader() {
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

