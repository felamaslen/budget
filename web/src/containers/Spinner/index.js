import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const Spinner = ({ active }) => active && (
    <div className="progress-outer">
        <div className="progress-inner">
            <div className="progress"></div>
        </div>
    </div>
);

Spinner.propTypes = {
    active: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    active: state.api.initialLoading
});

export default connect(mapStateToProps)(Spinner);
