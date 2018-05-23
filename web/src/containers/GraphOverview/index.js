import './style.scss';
import { connect } from 'react-redux';
import { aShowAllToggled } from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { DateTime } from 'luxon';
import { mediaQueryMobile } from '../../constants';
import { GRAPH_WIDTH } from '../../constants/graph';
import { getNow } from '../../helpers/date';
import GraphBalance from '../../components/GraphBalance';
import GraphSpending from '../../components/GraphSpending';

export function GraphOverviewWrapped({ spending, balance, ...props }) {
    let graphSpending = null;
    if (!props.isMobile) {
        graphSpending = <GraphSpending name="spend" {...spending} {...props} />;
    }

    return (
        <div className="graph-container-outer">
            <GraphBalance name="balance" {...balance} {...props} />
            {graphSpending}
        </div>
    );
}

GraphOverviewWrapped.propTypes = {
    isMobile: PropTypes.bool,
    now: PropTypes.instanceOf(DateTime).isRequired,
    graphWidth: PropTypes.number.isRequired,
    spending: PropTypes.object.isRequired,
    balance: PropTypes.object.isRequired
};

function mediaQueryWrapper(isMobile, props) {
    return <GraphOverviewWrapped isMobile={isMobile} {...props} />;
}

function GraphOverview(props) {
    return (
        <Media query={mediaQueryMobile}>
            {isMobile => mediaQueryWrapper(isMobile, props)}
        </Media>
    );
}

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

export default connect(mapStateToProps, mapDispatchToProps)(GraphOverview);

