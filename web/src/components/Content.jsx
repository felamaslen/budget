/**
 * Calls different page components
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aContentRequested } from '../actions/ContentActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Route } from 'react-router-dom';

import { PAGES } from '../misc/const';

import ModalDialog from './ModalDialog';
import PageOverview from './pages/PageOverview';
import getPageList from './pages/PageList';
import PageAnalysis from './pages/PageAnalysis';
import PageFunds from './pages/PageFunds';

export class Content extends Component {
    render() {
        if (!this.props.loggedIn) {
            return null;
        }

        const className = `page-wrapper page-${PAGES[this.props.pageIndex]}`;

        return <div className={className}>
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
    loaded: PropTypes.instanceOf(list).isRequired,
    loggedIn: PropTypes.bool.isRequired,
    pageIndex: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    pathname: ownProps.location.pathname,
    loaded: state.getIn(['global', 'pagesLoaded']),
    loggedIn: state.getIn(['global', 'user', 'uid']) > 0,
    pageIndex: state.getIn(['global', 'currentPageIndex'])
});

const mapDispatchToProps = dispatch => ({
    loadContent: pageIndex => dispatch(aContentRequested(pageIndex))
});

export default connect(mapStateToProps, mapDispatchToProps)(Content);

