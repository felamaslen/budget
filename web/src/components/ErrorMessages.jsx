/*
 * React component to display error messages
 */

import { List } from 'immutable';
import { connect } from 'react-redux';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
    ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR, ERROR_CLOSE_TIME
} from '../misc/const';
import { aErrorClosed, aErrorRemoved, aErrorsTimedout } from '../actions/ErrorActions';

class ErrorMessages extends Component {
    closeMessage(key) {
        this.dispatchAction(aErrorClosed(key));
        window.setTimeout(() => this.dispatchAction(aErrorRemoved(key)), ERROR_CLOSE_TIME);
    }
    componentDidMount() {
        window.setInterval(() => {
            this.props.clearErrorMessages();
        }, 1000);
    }
    render() {
        const messages = this.props.list.map((msg, key) => {
            const msgClasses = classNames({
                message: true,
                debug: msg.get('level') === ERROR_LEVEL_DEBUG,
                warn: msg.get('level') === ERROR_LEVEL_WARN,
                error: msg.get('level') === ERROR_LEVEL_ERROR,
                closed: msg.get('closed')
            });

            return (
                <li key={key} className={msgClasses} onClick={() => this.closeMessage(key)}>
                    <span>{msg.get('text')}</span>
                </li>
            );
        });

        return (
            <ul className="messages-outer">
                {messages}
            </ul>
        );
    }
}

ErrorMessages.propTypes = {
    list: PropTypes.instanceOf(List),
    clearErrorMessages: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    list: state.getIn(['global', 'errorMsg'])
});

const mapDispatchToProps = dispatch => ({
    closeMessage: key => {
        dispatch(aErrorClosed(key));

        setTimeout(() => dispatch(aErrorRemoved(key)), ERROR_CLOSE_TIME)
    },
    clearErrorMessages: () => dispatch(aErrorsTimedout())
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessages);

