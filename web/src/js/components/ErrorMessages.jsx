/*
 * React component to display error messages
 */

import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import PureControllerView from './PureControllerView';
import classNames from 'classnames';
import {
  ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARN, ERROR_LEVEL_ERROR, ERROR_CLOSE_TIME
} from '../misc/const';
import { aErrorClosed, aErrorRemoved } from '../actions/ErrorActions';

export class ErrorMessages extends PureControllerView {
  closeMessage(key) {
    this.dispatchAction(aErrorClosed(key));
    window.setTimeout(() => this.dispatchAction(aErrorRemoved(key)), ERROR_CLOSE_TIME);
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
      <ul className='messages-outer'>
        {messages}
      </ul>
    );
  }
}

ErrorMessages.propTypes = {
  list: PropTypes.instanceOf(List)
};

