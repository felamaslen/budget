/*
 * React component to display error messages
 */

import './style.scss';
import { List } from 'immutable';
import { connect } from 'react-redux';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
    ERROR_MESSAGE_DELAY, ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR, ERROR_CLOSE_TIME
} from '../../constants/error';
import { aErrorClosed, aErrorRemoved } from '../../actions/error.actions';

function ErrorMessages({ list, closeMessage }) {
    const [prevList, setPrevList] = useState(list);
    const hideTimers = useRef([]);

    useEffect(() => () => hideTimers.current.forEach(timer => clearTimeout(timer)), []);

    const onClose = useCallback(messageId => () => closeMessage(messageId));

    useEffect(() => {
        if (prevList.size < list.size) {
            const hideIds = list
                .filter(msg => !prevList.some(old => old.get('id') === msg.get('id')))
                .map(msg => msg.get('id'));

            hideIds.forEach(messageId => {
                hideTimers.current.push(setTimeout(onClose(messageId), ERROR_MESSAGE_DELAY));
            });
        }

        setPrevList(list);

    }, [list]);

    return (
        <ul className="messages-outer">
            {list.map((msg, key) => {
                const msgClasses = classNames('message', {
                    debug: msg.get('level') === ERROR_LEVEL_DEBUG,
                    warn: msg.get('level') === ERROR_LEVEL_WARN,
                    error: msg.get('level') === ERROR_LEVEL_ERROR,
                    closed: msg.get('closed')
                });

                return (
                    <li key={key} className={msgClasses} onClick={onClose(msg.get('id'))}>
                        <span>{msg.get('text')}</span>
                    </li>
                );
            })}
        </ul>
    );
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

