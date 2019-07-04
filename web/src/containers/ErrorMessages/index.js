/*
 * React component to display error messages
 */

import './style.scss';
import { connect } from 'react-redux';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR } from '~client/constants/error';
import { errorClosed } from '~client/actions/error';

const messageShape = PropTypes.shape({
    text: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired
}).isRequired;

function Message({ id, closed, message: { text, level }, onClose }) {
    const onCloseCallback = useCallback(() => onClose(id), [onClose, id]);

    return (
        <li
            className={classNames('message', {
                debug: level === ERROR_LEVEL_DEBUG,
                warn: level === ERROR_LEVEL_WARN,
                error: level === ERROR_LEVEL_ERROR,
                closed
            })}
            onClick={onCloseCallback}
        >
            <span>{text}</span>
        </li>
    );
}

Message.propTypes = {
    id: PropTypes.string.isRequired,
    closed: PropTypes.bool,
    message: messageShape,
    onClose: PropTypes.func.isRequired
};

const ErrorMessages = ({ list, onClose }) => (
    <ul className="messages-outer">
        {list.map(error => <Message key={error.id} {...error} onClose={onClose} />)}
    </ul>
);

ErrorMessages.propTypes = {
    list: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        closed: PropTypes.bool,
        message: messageShape
    }).isRequired).isRequired,
    onClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    list: state.error
});

const mapDispatchToProps = {
    onClose: errorClosed
};

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessages);
