import { connect } from 'react-redux';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class AppLogo extends Component {
    renderUnsavedChanges() {
        if (this.props.queueSize > 0) {
            return <span className="queue-not-saved">Unsaved changes!</span>;
        }

        return null;
    }
    renderLoadingSpinner() {
        if (this.props.loading) {
            return <span className="loading-api"></span>;
        }

        return null;
    }
    render() {
        return <div className="app-logo">
            {this.renderUnsavedChanges()}
            <a className="logo">
                <span>Budget</span>
                {this.renderLoadingSpinner()}
            </a>
        </div>;
    }
}

AppLogo.propTypes = {
    loading: PropTypes.bool.isRequired,
    queueSize: PropTypes.number.isRequired
};

const mapStateToProps = state => ({
    loading: state.getIn(['global', 'loadingApi']),
    queueSize: state.getIn(['global', 'edit', 'queue']).size +
        state.getIn(['global', 'edit', 'queueDelete']).size
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AppLogo);

