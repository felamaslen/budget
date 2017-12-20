/**
 * Analysis page component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aContentRequested } from '../../../actions/content.actions';

import React from 'react';
import PropTypes from 'prop-types';

import Page from '../../../components/page';
import Timeline from './timeline';
import Upper from './upper';
import ListTree from './list-tree';
import Blocks from './blocks';

import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../../../misc/const';
import { formatCurrency } from '../../../misc/format';

export class PageAnalysis extends Page {
    loadContent() {
        this.props.loadContent({
            page: 'analysis',
            loading: true,
            params: [
                ANALYSIS_PERIODS[this.props.periodKey],
                ANALYSIS_GROUPINGS[this.props.groupingKey],
                this.props.timeIndex
            ]
        });
    }
    format(value, abbreviate) {
        return formatCurrency(value, { abbreviate, precision: 1 });
    }
    render() {
        if (!this.props.loaded) {
            return null;
        }

        let timeline = null;
        if (this.props.timeline) {
            timeline = <Timeline data={this.props.timeline} />;
        }

        return <div className="page-analysis">
            <Upper />
            <div className="analysis-outer">
                {timeline}
                <ListTree />
                <Blocks />
            </div>
        </div>;
    }
}

PageAnalysis.propTypes = {
    loaded: PropTypes.bool.isRequired,
    periodKey: PropTypes.number.isRequired,
    groupingKey: PropTypes.number.isRequired,
    timeIndex: PropTypes.number.isRequired,
    timeline: PropTypes.instanceOf(list),
    loadContent: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    loaded: Boolean(state.getIn(['pagesLoaded', 'analysis'])),
    periodKey: state.getIn(['other', 'analysis', 'period']),
    groupingKey: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex']),
    timeline: state.getIn(['other', 'analysis', 'timeline'])
});

const mapDispatchToProps = dispatch => ({
    loadContent: req => dispatch(aContentRequested(req))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);

