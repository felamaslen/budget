/**
 * Overview page component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aKeyPressed } from '../../../actions/app.actions';
import { aContentRequested } from '../../../actions/content.actions';

import React from 'react';
import PropTypes from 'prop-types';

import Page from '../../../components/page';

import OverviewTable from './table';
import OverviewGraphs from './graph';
import { PAGES } from '../../../misc/const';

const pageIndex = PAGES.indexOf('overview');

export class PageOverview extends Page {
    render() {
        if (!this.props.loaded) {
            return null;
        }

        return <div className="page-overview">
            <OverviewTable pageIndex={pageIndex} />
            <OverviewGraphs />
        </div>;
    }
}

PageOverview.propTypes = {
    rows: PropTypes.instanceOf(list),
    loaded: PropTypes.bool.isRequired,
    handleKeyPress: PropTypes.func.isRequired,
    loadContent: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    pageIndex,
    rows: state.getIn(['pages', pageIndex, 'rows']),
    loaded: Boolean(state.getIn(['pagesLoaded', pageIndex]))
});

const mapDispatchToProps = dispatch => ({
    loadContent: req => dispatch(aContentRequested(req)),
    handleKeyPress: event => dispatch(aKeyPressed(event))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageOverview);

