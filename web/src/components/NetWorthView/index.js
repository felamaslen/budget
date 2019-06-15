import React from 'react';

import { netWorthList } from '~client/components/NetWorthList/prop-types';

import './style.scss';

export default function NetWorthView({ data }) {
    if (!data) {
        return null;
    }

    return (
        <div className="net-worth-view">
            <h4 className="title">{'View'}</h4>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

NetWorthView.propTypes = {
    data: netWorthList
};
