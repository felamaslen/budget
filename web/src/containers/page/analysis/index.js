/**
 * Analysis page component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';
import { aContentRequested } from '../../../actions/content.actions';
import React from 'react';
import PureComponent from '../../../immutable-component';
import PropTypes from 'prop-types';

import Timeline from './timeline';
import Upper from './upper';
import ListTree from './list-tree';
import Blocks from './blocks';

export class PageAnalysis extends PureComponent {
    componentDidMount() {
        this.props.onLoad();
    }
    render() {
        const { loaded, timeline } = this.props;

        if (!loaded) {
            return null;
        }

        let TimelineView = null;
        if (timeline) {
            TimelineView = <Timeline data={timeline} />;
        }

        return <div className="page-analysis">
            <Upper />
            <div className="analysis-outer">
                {TimelineView}
                <ListTree />
                <Blocks />
            </div>
        </div>;
    }
}

PageAnalysis.propTypes = {
    loaded: PropTypes.bool.isRequired,
    timeline: PropTypes.instanceOf(list),
    onLoad: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    loaded: Boolean(state.getIn(['pagesLoaded', 'analysis'])),
    timeline: state.getIn(['other', 'analysis', 'timeline'])
});

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(aContentRequested({ page: 'analysis' }))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);

