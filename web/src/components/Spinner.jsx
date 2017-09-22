/**
 * Display a loading spinner
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Spinner extends Component {
    render() {
        if (!this.props.active) {
            return null;
        }

        return <div className="progress-outer">
            <div className="progress-inner">
                <div className="progress"></div>
            </div>
        </div>;
    }
}

Spinner.propTypes = {
    active: PropTypes.bool.isRequired
};

