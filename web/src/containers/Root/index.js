import './style.scss';
import { connect, Provider } from 'react-redux';
import { aUserLoggedOut } from '~client/actions/app.actions';
import { aPageSet, aContentRequested } from '~client/actions/content.actions';
import { getLoggedIn } from '~client/selectors/app';
import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';
import ErrorMessages from '../ErrorMessages';
import Spinner from '../Spinner';
import LoginForm from '../LoginForm';
import Content from '~client/components/Content';
import Header from '~client/components/Header';

function Root({ store, loggedIn, loadContent, ...props }) {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <div className="main">
                    <Header loggedIn={loggedIn} {...props} />
                    <ErrorMessages />
                    <LoginForm />
                    <Content loggedIn={loggedIn} loadContent={loadContent} />
                    <Spinner />
                </div>
            </BrowserRouter>
        </Provider>
    );
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    loadContent: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    loadingApi: state.get('loadingApi'),
    unsavedApi: state.getIn(['edit', 'requestList']).size > 0,
    loggedIn: getLoggedIn(state)
});

const mapDispatchToProps = dispatch => ({
    onPageSet: page => () => dispatch(aPageSet(page)),
    onLogout: () => dispatch(aUserLoggedOut()),
    loadContent: page => dispatch(aContentRequested(page))
});

export default connect(mapStateToProps, mapDispatchToProps)(Root);
