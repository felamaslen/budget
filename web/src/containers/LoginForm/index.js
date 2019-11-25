import { connect } from 'react-redux';
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { loginRequested } from '~client/actions/login';
import { getLoggedIn } from '~client/selectors/app';
import PinDisplay from '~client/components/LoginForm/pin-display';
import NumberInputPad from '~client/components/LoginForm/number-input-pad';
import { LOGIN_INPUT_LENGTH } from '~client/constants/data';

import * as Styled from './styles';

function LoginForm({ loading, initialised, loggedIn, onLogin }) {
    const [pin, setPin] = useState('');
    const onInput = useCallback(digit => setPin(last => `${last}${digit}`), []);

    const onKeydown = useCallback(
        event => {
            if (!Number.isNaN(Number(event.key))) {
                onInput(event.key);
            }
        },
        [onInput],
    );

    useEffect(() => {
        if (loggedIn) {
            window.removeEventListener('keydown', onKeydown);
        } else {
            window.addEventListener('keydown', onKeydown);
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

    if (loggedIn || !initialised) {
        return null;
    }

    return (
        <Styled.Form isLoading={loading}>
            <Styled.FormInner>
                <Styled.Title>{'Enter your PIN:'}</Styled.Title>
                <PinDisplay inputStep={inputStep} />
                <NumberInputPad onInput={onInput} />
            </Styled.FormInner>
        </Styled.Form>
    );
}

LoginForm.propTypes = {
    initialised: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    onLogin: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    initialised: state.login.initialised,
    loading: state.login.loading,
    loggedIn: getLoggedIn(state),
});

const mapDispatchToProps = {
    onLogin: loginRequested,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoginForm);
