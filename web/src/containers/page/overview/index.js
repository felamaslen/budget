/**
 * Overview page component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aContentRequested } from '../../../actions/content.actions';

import React from 'react';
import PropTypes from 'prop-types';

import Page from '../../../components/page';

import OverviewTable from './table';
import OverviewGraphs from './graph';

export class PageOverview extends Page {
    render() {
        if (!this.props.loaded) {
            return null;
        }

        return <div className="page-overview">
            <OverviewTable />
            <OverviewGraphs />
        </div>;
    }
}

PageOverview.propTypes = {
    rows: PropTypes.instanceOf(list),
    loaded: PropTypes.bool.isRequired,
    loadContent: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    page: 'overview',
    rows: state.getIn(['pages', 'overview', 'rows']),
    loaded: Boolean(state.getIn(['pagesLoaded', 'overview']))
});

const mapDispatchToProps = dispatch => ({
    loadContent: req => dispatch(aContentRequested(req))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageOverview);

