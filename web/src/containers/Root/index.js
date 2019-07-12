import { connect, Provider } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';

import { getLoggedIn } from '~client/selectors/app';

import Header from '~client/containers/Header';
import ErrorMessages from '~client/containers/ErrorMessages';
import Spinner from '~client/containers/Spinner';
import LoginForm from '~client/containers/LoginForm';
import Content from '~client/components/Content';

import './style.scss';

const Root = ({ store, loggedIn, initialLoading }) => (
    <Provider store={store}>
        <BrowserRouter>
            <div className="main">
                <Header />
                <ErrorMessages />
                <LoginForm />
                {loggedIn && !initialLoading && <Content />}
                <Spinner />
            </div>
        </BrowserRouter>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    initialLoading: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    loggedIn: getLoggedIn(state),
    initialLoading: state.api.initialLoading
});

export default connect(mapStateToProps)(Root);
