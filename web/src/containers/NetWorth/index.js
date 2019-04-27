import { connect } from 'react-redux';
import React from 'react';

import './style.scss';

function NetWorth() {
    return (
        <div className="net-worth">
            <h1>{'Net worth'}</h1>
        </div>
    );
}

export default connect()(NetWorth);
