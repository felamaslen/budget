/**
 * Display a loading spinner
 */

import React from 'react';

export class Spinner extends React.Component {
    render() {
        return (
            <div className="progress-outer">
                <div className="progress-inner">
                    <div className="progress"></div>
                </div>
            </div>
        );
    }
}

