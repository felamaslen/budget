/**
 * Analysis page component
 */

import './style.scss';
import { connect } from 'react-redux';
import { aContentRequested } from '~client/actions/content.actions';
import React from 'react';
import PropTypes from 'prop-types';
import { timelineShape } from '~client/containers/PageAnalysis/prop-types';
import Page from '~client/containers/Page';
import Timeline from './timeline';
import Upper from './upper';
import ListTree from './list-tree';
import Blocks from './blocks';

function PageAnalysis({ timeline }) {
    let TimelineView = null;
    if (timeline) {
        TimelineView = <Timeline data={timeline} />;
    }

    return (
        <Page page="analysis">
            <Upper />
            <div className="analysis-outer">
                {TimelineView}
                <ListTree />
                <Blocks />
            </div>
        </Page>
    );
}

PageAnalysis.propTypes = {
    timeline: timelineShape,
    onLoad: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    timeline: state.other.analysis.timeline
});

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(aContentRequested({ page: 'analysis' }))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);
