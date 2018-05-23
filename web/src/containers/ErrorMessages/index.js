/*
 * React component to display error messages
 */

import './style.scss';
import { List } from 'immutable';
import { connect } from 'react-redux';
import React from 'react';
import PureComponent from '../../ImmutableComponent';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
    ERROR_MESSAGE_DELAY, ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR, ERROR_CLOSE_TIME
} from '../../constants/error';
import { aErrorClosed, aErrorRemoved } from '../../actions/error.actions';

class ErrorMessages extends PureComponent {
    componentDidUpdate(prevProps) {
        const messagesAdded = prevProps.list.size < this.props.list.size;
        if (messagesAdded) {
            this.props.list
                .filter(msg => prevProps.list.findIndex(
                    old => old.get('id') === msg.get('id')
                ) === -1)
                .map(msg => msg.get('id'))
                .forEach(msgId => setTimeout(
                    () => this.props.closeMessage(msgId), ERROR_MESSAGE_DELAY)
                );
        }
    }
    render() {
        const messages = this.props.list.map((msg, key) => {
            const msgClasses = classNames('message', {
                debug: msg.get('level') === ERROR_LEVEL_DEBUG,
                warn: msg.get('level') === ERROR_LEVEL_WARN,
                error: msg.get('level') === ERROR_LEVEL_ERROR,
                closed: msg.get('closed')
            });

            const closeMessage = () => this.props.closeMessage(msg.get('id'));

            return <li key={key} className={msgClasses} onClick={closeMessage}>
                <span>{msg.get('text')}</span>
            </li>;
        });

        return <ul className="messages-outer">
            {messages}
        </ul>;
    }
}

ErrorMessages.propTypes = {
    list: PropTypes.instanceOf(List),
    closeMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    list: state.getIn(['errorMsg'])
});

const mapDispatchToProps = dispatch => ({
    closeMessage: msgId => {
        dispatch(aErrorClosed(msgId));

        setTimeout(() => dispatch(aErrorRemoved(msgId)), ERROR_CLOSE_TIME);
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessages);

