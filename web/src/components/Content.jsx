/**
 * Calls different page components
 */

import { connect } from 'react-redux';

import { aContentRequested } from '../actions/ContentActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Route } from 'react-router-dom';

import { PAGES } from '../misc/const';

import ModalDialog from './ModalDialog';
import PageOverview from './pages/PageOverview';
import getPageList from './PageList';
import PageAnalysis from './pages/PageAnalysis';
import PageFunds from './pages/PageFunds';

export class Content extends Component {
    render() {
        if (!this.props.loggedIn) {
            return null;
        }

        return <div className="page-wrapper">
            <div className="inner">
                <Route exact path="/" component={PageOverview} />
                <Route path="/analysis" component={PageAnalysis} />
                <Route path="/funds" component={PageFunds} />
                <Route path="/income" component={getPageList(PAGES.indexOf('income'))} />
                <Route path="/bills" component={getPageList(PAGES.indexOf('bills'))} />
                <Route path="/food" component={getPageList(PAGES.indexOf('food'))} />
                <Route path="/general" component={getPageList(PAGES.indexOf('general'))} />
                <Route path="/holiday" component={getPageList(PAGES.indexOf('holiday'))} />
                <Route path="/social" component={getPageList(PAGES.indexOf('social'))} />
            </div>
            <ModalDialog />
        </div>;
    }
}

Content.propTypes = {
    pathname: PropTypes.string.isRequired,
    loggedIn: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    pathname: ownProps.location.pathname,
    loggedIn: state.getIn(['global', 'user', 'uid']) > 0
});

const mapDispatchToProps = dispatch => ({
    loadContent: pageIndex => dispatch(aContentRequested(pageIndex))
});

export default connect(mapStateToProps, mapDispatchToProps)(Content);

