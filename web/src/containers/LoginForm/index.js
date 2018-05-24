/*
 * React component to display a form
 */

import { connect } from 'react-redux';
import './style.scss';
import { aLoginFormInputted } from '../../actions/login.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PinDisplay from '../../components/LoginForm/pin-display';
import NumberInputPad from '../../components/LoginForm/number-input-pad';

function LoginForm({ visible, active, inputStep, inputDigit }) {
    if (!visible) {
        return null;
    }

    const onInput = digit => active && inputDigit(digit);

    const outerClasses = classNames('login-form', { active });

    return <div className={outerClasses}>
        <h3>{'Enter your PIN:'}</h3>
        <PinDisplay inputStep={inputStep} />
        <NumberInputPad onInput={onInput} />
    </div>;
}

LoginForm.propTypes = {
    inputStep: PropTypes.number.isRequired,
    pin: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    inputDigit: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    inputStep: state.getIn(['loginForm', 'inputStep']),
    pin: state.getIn(['loginForm', 'values']).join(''),
    visible: state.getIn(['loginForm', 'visible']),
    active: state.getIn(['loginForm', 'active'])
});

const mapDispatchToProps = dispatch => ({
    inputDigit: digit => dispatch(aLoginFormInputted(digit))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);

