/**
 * Display a loading spinner
 */

import { connect } from 'react-redux';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class Spinner extends Component {
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

const mapStateToProps = state => ({ active: state.getIn(['global', 'loading']) });

export default connect(mapStateToProps)(Spinner);

