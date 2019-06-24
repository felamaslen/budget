/*
 * React component to display error messages
 */

import './style.scss';
import { connect } from 'react-redux';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
    ERROR_MESSAGE_DELAY, ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR, ERROR_CLOSE_TIME
} from '~client/constants/error';
import { aErrorClosed, aErrorRemoved } from '~client/actions/error.actions';

function ErrorMessages({ list, closeMessage }) {
    const [prevList, setPrevList] = useState(list);
    const hideTimers = useRef([]);

    useEffect(() => () => hideTimers.current.forEach(timer => clearTimeout(timer)), []);

    const onClose = useCallback(messageId => () => closeMessage(messageId), [closeMessage]);

    useEffect(() => {
        if (prevList.size < list.size) {
            const hideIds = list.map(({ id }) => id)
                .filter(msgId => !prevList.some(({ id }) => id === msgId));

            hideIds.forEach(messageId => {
                hideTimers.current.push(setTimeout(onClose(messageId), ERROR_MESSAGE_DELAY));
            });
        }

        setPrevList(list);

    }, [list, prevList, onClose]);

    return (
        <ul className="messages-outer">
            {list.map(({ id, level, closed, text }) => (
                <li key={id}
                    className={classNames('message', {
                        debug: level === ERROR_LEVEL_DEBUG,
                        warn: level === ERROR_LEVEL_WARN,
                        error: level === ERROR_LEVEL_ERROR,
                        closed
                    })}
                    onClick={onClose(id)}
                >
                    <span>{text}</span>
                </li>
            ))}
        </ul>
    );
}

ErrorMessages.propTypes = {
    list: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        level: PropTypes.number.isRequired,
        closed: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired
    }).isRequired),
    closeMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    list: state.errorMsg
});

const mapDispatchToProps = dispatch => ({
    closeMessage: msgId => {
        dispatch(aErrorClosed(msgId));

        setTimeout(() => dispatch(aErrorRemoved(msgId)), ERROR_CLOSE_TIME);
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessages);
