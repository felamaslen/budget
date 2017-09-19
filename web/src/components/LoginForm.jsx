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
    renderDigit(digit) {
        const btnClass = `btn-digit btn-digit-${digit}`;

        const onClick = () => this.input(digit);

        return <button key={digit} className={btnClass}
            onClick={onClick}>{digit}</button>;
    }
    renderNumberInput() {
        const digits = new Array(4)
            .fill(0)
            .map((item, rowKey) => {
                if (rowKey < 3) {
                    const row = new Array(3)
                        .fill(0)
                        .map((column, colKey) => {
                            const digit = (rowKey * 3 + colKey + 1) % 10;

                            return this.renderDigit(digit);
                        });

                    return <div key={rowKey} className="number-input-row">{row}</div>;
                }

                return <div key={rowKey} className="number-input-row">
                    {this.renderDigit(0)}
                </div>;
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
            <div className="login-form">
                <h3>Enter your PIN:</h3>
                <div className="pin-display">
                    {digitBoxes}
                </div>
                {numberInput}
            </div>
        );
    }
}

LoginForm.propTypes = {
    loading: PropTypes.bool,
    inputStep: PropTypes.number
};

