/**
 * Calls different page components
 */

import { Map as map, List as list } from 'immutable';
import { connect } from 'react-redux';

import { aContentRequested } from '../actions/ContentActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Route } from 'react-router-dom';

import { PAGES, LIST_PAGES, DAILY_PAGES } from '../misc/const';

import Spinner from './Spinner';
import ModalDialog from './ModalDialog';
import PageOverview from './pages/PageOverview';
import PageList from './pages/PageList';
import PageAnalysis from './pages/PageAnalysis';
import PageFunds from './pages/PageFunds';

export class Content extends Component {
    renderPage() {
        /*

        if (page === 'analysis') {
            return <PageAnalysis />;
        }

        if (page === 'funds') {
            // funds page
            return (
                <PageFunds
                    data={data}
                    edit={this.props.edit.get('active')}
                    add={this.props.edit.get('add')}
                    addBtnFocus={this.props.edit.get('addBtnFocus')}
                    daily={DAILY_PAGES[this.props.index]}
                    index={this.props.index}
                    page={page}
                    graphProps={this.props.other.get('graphFunds')}
                    stocksListProps={this.props.other.get('stocksList')}
                    cachedValue={this.props.other.get('fundsCachedValue')}
                    suggestions={null} />
            );
        }

        if (LIST_PAGES.indexOf(this.props.pageIndex) > -1) {
            // list page (e.g. food)
            return <PageList />;
        }

        */
    }
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

