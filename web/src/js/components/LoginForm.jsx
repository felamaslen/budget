/*
 * React component to display a form
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import classNames from 'classnames';
import { aLoginFormInputted } from '../actions/LoginActions';
import { LOGIN_INPUT_LENGTH } from '../misc/const';

export class LoginForm extends PureControllerView {
  // input a digit into the form
  input(digit) {
    this.dispatchAction(aLoginFormInputted(digit));
  }
  renderNumberInput() {
    const digits = Array.apply(null, new Array(10)).map((_, key) => {
      const digit = (key + 1) % 10;
      const btnClass = `btn-digit btn-digit-${digit}`;
      return (
        <button key={key} className={btnClass}
        onClick={() => this.input(digit)}>{digit}</button>
      );
    });
    return <div className='number-input noselect'>{digits}</div>;
  }
  render() {
    const numberInput = this.renderNumberInput();
    return (
      <div id='login-form'>
        <h3>Enter your PIN:</h3>
        {Array.apply(null, new Array(LOGIN_INPUT_LENGTH)).map((_, key) => {
          return (
            <div key={key} className={classNames({
              'input-pin': true,
              active: key === this.props.inputStep,
              done: key < this.props.inputStep
            })} />
          );
        })}
        {numberInput}
      </div>
    );
  }
}

LoginForm.propTypes = {
  loading: PropTypes.bool,
  inputStep: PropTypes.number
};

