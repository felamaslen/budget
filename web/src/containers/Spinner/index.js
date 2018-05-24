/**
 * Display a loading spinner
 */

import './style.scss';
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

export function Spinner({ active }) {
    if (!active) {
        return null;
    }

    return <div className="progress-outer">
        <div className="progress-inner">
            <div className="progress"></div>
        </div>
    </div>;
}

Spinner.propTypes = {
    active: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    active: state.get('loading')
});

export default connect(mapStateToProps)(Spinner);

