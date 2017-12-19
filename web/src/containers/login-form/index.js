/*
 * React component to display a form
 */

import { connect } from 'react-redux';

import { aLoginFormInputted, aLoginFormSubmitted } from '../../actions/login.actions';
import { LOGIN_INPUT_LENGTH } from '../../misc/const';

import React from 'react';
import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PinDisplay from '../../components/login-form/pin-display';
import NumberInputPad from '../../components/login-form/number-input-pad';

export class LoginForm extends PureComponent {
    componentDidUpdate(prevProps) {
        const pinWasComplete = prevProps.pin.length >= LOGIN_INPUT_LENGTH;
        const pinIsComplete = this.props.pin.length >= LOGIN_INPUT_LENGTH;

        if (!pinWasComplete && pinIsComplete) {
            this.props.tryLogin(this.props.pin);
        }
    }
    render() {
        if (!this.props.visible) {
            return null;
        }

        const onInput = digit => this.props.active && this.props.inputDigit(digit);

        const outerClasses = classNames({
            'login-form': true,
            active: this.props.active
        });

        return <div className={outerClasses}>
            <h3>Enter your PIN:</h3>
            <PinDisplay inputStep={this.props.inputStep} />
            <NumberInputPad onInput={onInput} />
        </div>;
    }
}

LoginForm.propTypes = {
    inputStep: PropTypes.number.isRequired,
    pin: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    inputDigit: PropTypes.func.isRequired,
    tryLogin: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    inputStep: state.getIn(['loginForm', 'inputStep']),
    pin: state.getIn(['loginForm', 'values']).join(''),
    visible: state.getIn(['loginForm', 'visible']),
    active: state.getIn(['loginForm', 'active'])
});

const mapDispatchToProps = dispatch => ({
    inputDigit: digit => dispatch(aLoginFormInputted(digit)),
    tryLogin: pin => dispatch(aLoginFormSubmitted(pin))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);

