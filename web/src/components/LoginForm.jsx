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
        const digits = new Array(10)
            .fill(0)
            .map((item, key) => {
                const digit = (key + 1) % 10;
                const btnClass = `btn-digit btn-digit-${digit}`;

                const onClick = () => this.input(digit);

                return (
                    <button key={key} className={btnClass} onClick={onClick}>
                        {digit}
                    </button>
                );
            });

        return <div className="number-input noselect">{digits}</div>;
    }
    render() {
        const numberInput = this.renderNumberInput();

        const digitBoxes = new Array(LOGIN_INPUT_LENGTH)
            .fill(0)
            .map((item, key) => {
                const className = classNames({
                    'input-pin': true,
                    active: key === this.props.inputStep,
                    done: key < this.props.inputStep
                });

                return <div key={key} className={className} />;
            });

        return (
            <div id="login-form">
                <h3>Enter your PIN:</h3>
                {digitBoxes}
                {numberInput}
            </div>
        );
    }
}

LoginForm.propTypes = {
    loading: PropTypes.bool,
    inputStep: PropTypes.number
};

