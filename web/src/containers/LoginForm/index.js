import { connect } from 'react-redux';
import './style.scss';
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { loginRequested } from '~client/actions/login';
import { getLoggedIn } from '~client/selectors/app';
import PinDisplay from '~client/components/LoginForm/pin-display';
import NumberInputPad from '~client/components/LoginForm/number-input-pad';
import { LOGIN_INPUT_LENGTH } from '~client/constants/data';

function LoginForm({ loading, loggedIn, onLogin }) {
    const [pin, setPin] = useState('');
    const onInput = useCallback(digit => setPin(last => `${last}${digit}`), []);

    const onKeydown = useCallback(event => {
        if (!isNaN(Number(event.key))) {
            onInput(event.key);
        }
    }, [onInput]);

    useEffect(() => {
        if (loggedIn) {
            window.addEventListener('keydown', onKeydown);
        } else {
            window.removeEventListener('keydown', onKeydown);
        }

        return () => window.removeEventListener('keydown', onKeydown);
    }, [loggedIn, onKeydown]);

    const inputStep = pin.length;

    useEffect(() => {
        if (!loggedIn && !loading && pin.length >= LOGIN_INPUT_LENGTH) {
            onLogin(Number(pin));
            setPin('');
        }
    }, [loggedIn, loading, onLogin, pin]);

    if (loggedIn) {
        return null;
    }

    return (
        <div className={classNames('login-form', { loading })}>
            <h3>{'Enter your PIN:'}</h3>
            <PinDisplay inputStep={inputStep} />
            <NumberInputPad onInput={onInput} />
        </div>
    );
}

LoginForm.propTypes = {
    loading: PropTypes.bool.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    onLogin: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    loading: state.login.loading,
    loggedIn: getLoggedIn(state)
});

const mapDispatchToProps = {
    onLogin: loginRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
