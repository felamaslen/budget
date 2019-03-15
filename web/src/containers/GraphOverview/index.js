import './style.scss';
import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aShowAllToggled } from '~client/actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueryMobile } from '~client/constants';
import { getTargets } from '~client/selectors/graph';
import { getCurrentDate, getStartDate, getFutureMonths, getProcessedCost } from '~client/selectors/overview';
import { GRAPH_WIDTH } from '~client/constants/graph';
import GraphBalance from '~client/components/GraphBalance';
import GraphSpending from '~client/components/GraphSpending';

export function GraphOverviewWrapped({ futureMonths, cost, showAll, targets, ...props }) {
    let graphSpending = null;
    if (!props.isMobile) {
        graphSpending = (
            <GraphSpending name="spend"
                {...props}
                valuesNet={cost.get('net')}
                valuesSpending={cost.get('spending')}
            />
        );
    }

    return (
        <div className="graph-container-outer">
            <GraphBalance name="balance"
                {...props}
                futureMonths={futureMonths}
                cost={cost}
                showAll={showAll}
                targets={targets}
            />
            {graphSpending}
        </div>
    );
}

GraphOverviewWrapped.propTypes = {
    isMobile: PropTypes.bool,
    futureMonths: PropTypes.number.isRequired,
    cost: PropTypes.instanceOf(map).isRequired,
    showAll: PropTypes.bool.isRequired,
    targets: PropTypes.instanceOf(list).isRequired,
    graphWidth: PropTypes.number.isRequired
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
    now: getCurrentDate(state),
    startDate: getStartDate(state),
    graphWidth: Math.min(state.getIn(['other', 'windowWidth']), GRAPH_WIDTH),
    cost: getProcessedCost(state),
    futureMonths: getFutureMonths(state),
    showAll: state.getIn(['other', 'showAllBalanceGraph']),
    targets: getTargets(state)
});

const mapDispatchToProps = dispatch => ({
    onShowAll: () => dispatch(aShowAllToggled())
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphOverview);

