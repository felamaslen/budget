/**
 * Calls different page components
 */

import { connect } from 'react-redux';

import { aContentRequested } from '../../actions/content.actions';

import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import ModalDialog from '../modal-dialog';
import PageOverview from '../page/overview';
import PageAnalysis from '../page/analysis';
import PageList from '../page/list';

export function Content({ loggedIn }) {
    if (!loggedIn) {
        return null;
    }

    return <div className="page-wrapper">
        <div className="inner">
            <Route exact path="/" component={PageOverview} />
            <Route path="/analysis" component={PageAnalysis} />
            <Route path="/funds" render={() => <PageList page="funds" />} />
            <Route path="/income" render={() => <PageList page="income" />} />
            <Route path="/bills" render={() => <PageList page="bills" />} />
            <Route path="/food" render={() => <PageList page="food" />} />
            <Route path="/general" render={() => <PageList page="general" />} />
            <Route path="/holiday" render={() => <PageList page="holiday" />} />
            <Route path="/social" render={() => <PageList page="social" />} />
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

