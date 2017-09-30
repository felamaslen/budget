/*
 * React component to display a form
 */

import { connect } from 'react-redux';

import { aKeyPressed } from '../actions/AppActions';
import { aLoginFormInputted, aLoginFormSubmitted } from '../actions/LoginActions';
import { LOGIN_INPUT_LENGTH } from '../misc/const';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export class LoginForm extends PureComponent {
    constructor(props) {
        super(props);

        this.keydownListener = evt => this.props.handleKeyPress({ key: evt.key });
    }
    componentDidUpdate(prevProps) {
        const pinWasComplete = prevProps.pin.length >= LOGIN_INPUT_LENGTH;
        const pinIsComplete = this.props.pin.length >= LOGIN_INPUT_LENGTH;

        if (!pinWasComplete && pinIsComplete) {
            this.props.tryLogin(this.props.pin);
        }
    }
    componentWillUpdate(nextProps) {
        if (!nextProps.visible && this.props.visible) {
            window.removeEventListener('keydown', this.keydownListener);
        }
        else if (nextProps.visible && !this.props.visible) {
            window.addEventListener('keydown', this.keydownListener);
        }
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.keydownListener);
    }

    // input a digit into the form
    input(digit) {
        if (this.props.active) {
            this.props.inputDigit(digit);
        }
    }
    renderDigit(digit) {
        const btnClass = `btn-digit btn-digit-${digit}`;

        const onClick = () => this.input(digit);

        return <button key={digit} className={btnClass}
            onMouseDown={onClick}>{digit}</button>;
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
        if (!this.props.visible) {
            return null;
        }

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

        const outerClasses = classNames({
            'login-form': true,
            active: this.props.active
        });

        return <div className={outerClasses}>
            <h3>Enter your PIN:</h3>
            <div className="pin-display">
                {digitBoxes}
            </div>
            {numberInput}
        </div>;
    }
}

LoginForm.propTypes = {
    inputStep: PropTypes.number.isRequired,
    pin: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    inputDigit: PropTypes.func.isRequired,
    tryLogin: PropTypes.func.isRequired,
    handleKeyPress: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    inputStep: state.getIn(['global', 'loginForm', 'inputStep']),
    pin: state.getIn(['global', 'loginForm', 'values']).join(''),
    visible: state.getIn(['global', 'loginForm', 'visible']),
    active: state.getIn(['global', 'loginForm', 'active'])
});

const mapDispatchToProps = dispatch => ({
    inputDigit: digit => dispatch(aLoginFormInputted(digit)),
    tryLogin: pin => dispatch(aLoginFormSubmitted(pin)),
    handleKeyPress: req => dispatch(aKeyPressed(req))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);

