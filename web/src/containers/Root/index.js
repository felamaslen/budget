import { connect, Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';

import { getLoggedIn } from '~client/selectors/app';

import { Main } from '~client/styled/shared/page';

import StyleReset from '~client/styled/reset';
import Header from '~client/containers/Header';
import ErrorMessages from '~client/containers/ErrorMessages';
import Spinner from '~client/containers/Spinner';
import LoginForm from '~client/containers/LoginForm';
import Content from '~client/components/Content';

const Root = ({ store, loggedIn, initialLoading }) => (
    <Provider store={store}>
        <Main>
            <StyleReset />
            <Header />
            <ErrorMessages />
            <LoginForm />
            {loggedIn && !initialLoading && <Content />}
            <Spinner />
        </Main>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    initialLoading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    loggedIn: getLoggedIn(state),
    initialLoading: state.api.initialLoading,
});

export default withRouter(connect(mapStateToProps)(Root));
