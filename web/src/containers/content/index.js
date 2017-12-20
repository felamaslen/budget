/**
 * Calls different page components
 */

import { connect } from 'react-redux';

import { aContentRequested } from '../../actions/content.actions';

import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import { PAGES } from '../../misc/const';

import ModalDialog from '../modal-dialog';
import PageOverview from '../page/overview';
import { PageListContainer as getPageList } from '../page/list';
import PageAnalysis from '../page/analysis';
import PageFunds from '../page/funds';

export function Content({ loggedIn }) {
    if (!loggedIn) {
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

Content.propTypes = {
    pathname: PropTypes.string.isRequired,
    loggedIn: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    pathname: ownProps.location.pathname,
    loggedIn: state.getIn(['user', 'uid']) > 0
});

const mapDispatchToProps = dispatch => ({
    loadContent: page => dispatch(aContentRequested(page))
});

export default connect(mapStateToProps, mapDispatchToProps)(Content);

