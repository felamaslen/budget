import { connect, Provider } from 'react-redux';
import { aUserLoggedOut } from '../../actions/app.actions';
import { aPageSet, aContentRequested } from '../../actions/content.actions';
import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';
import ErrorMessages from '../ErrorMessages';
import Spinner from '../Spinner';
import LoginForm from '../LoginForm';
import Content from '../../components/Content';
import Header from '../../components/Header';

function Root({ store, loggedIn, loadContent, ...props }) {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <div className="main">
                    <Header {...props} />
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
    navActive: state.getIn(['user', 'uid']) > 0,
    loadingApi: state.get('loadingApi'),
    unsavedApi: state.getIn(['edit', 'requestList']).size > 0,
    loggedIn: state.getIn(['user', 'uid']) > 0
});

const mapDispatchToProps = dispatch => ({
    onPageSet: page => () => dispatch(aPageSet(page)),
    onLogout: () => dispatch(aUserLoggedOut()),
    loadContent: page => dispatch(aContentRequested(page))
});

export default connect(mapStateToProps, mapDispatchToProps)(Root);

