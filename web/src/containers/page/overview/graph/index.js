import { connect } from 'react-redux';
import { aShowAllToggled } from '../../../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { DateTime } from 'luxon';
import { mediaQueries } from '../../../../constants';
import { GRAPH_WIDTH } from '../../../../constants/graph';
import { getNow } from '../../../../misc/date';
import GraphBalance from './balance';
import GraphSpending from './spending';

export function OverviewGraphs({ spending, balance, ...props }) {
    const graphSpending = render => {
        if (render) {
            return <GraphSpending name="spend" {...spending} {...props} />;
        }

        return null;
    };


    return <div className="graph-container-outer">
        <GraphBalance name="balance" {...balance} {...props} />
        <Media query={mediaQueries.desktop}>{graphSpending}</Media>
    </div>;
}

OverviewGraphs.propTypes = {
    now: PropTypes.instanceOf(DateTime).isRequired,
    graphWidth: PropTypes.number.isRequired,
    spending: PropTypes.object.isRequired,
    balance: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    now: getNow(),
    startDate: state.getIn(['pages', 'overview', 'data', 'startDate']),
    currentDate: state.getIn(['pages', 'overview', 'data', 'currentDate']),
    graphWidth: Math.min(state.getIn(['other', 'windowWidth']), GRAPH_WIDTH),
    spending: {
        valuesNet: state.getIn(['pages', 'overview', 'data', 'cost', 'net']),
        valuesSpending: state.getIn(['pages', 'overview', 'data', 'cost', 'spending'])
    },
    balance: {
        futureMonths: state.getIn(['pages', 'overview', 'data', 'futureMonths']),
        cost: state.getIn(['pages', 'overview', 'data', 'cost']),
        showAll: state.getIn(['other', 'showAllBalanceGraph']),
        targets: state.getIn(['pages', 'overview', 'data', 'targets'])
    }
});

const mapDispatchToProps = dispatch => ({
    onShowAll: () => dispatch(aShowAllToggled())
});

export default connect(mapStateToProps, mapDispatchToProps)(OverviewGraphs);

