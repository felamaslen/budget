import './style.scss';
import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import { aShowAllToggled } from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueryMobile } from '../../constants';
import { getTargets } from '../../selectors/graph';
import { GRAPH_WIDTH } from '../../constants/graph';
import GraphBalance from '../../components/GraphBalance';
import GraphSpending from '../../components/GraphSpending';

export function GraphOverviewWrapped({ valuesNet, valuesSpending, futureMonths, cost, showAll, targets, ...props }) {
    let graphSpending = null;
    if (!props.isMobile) {
        graphSpending = (
            <GraphSpending name="spend"
                {...props}
                valuesNet={valuesNet}
                valuesSpending={valuesSpending}
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
    valuesNet: PropTypes.instanceOf(list).isRequired,
    valuesSpending: PropTypes.instanceOf(list).isRequired,
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
    now: state.get('now'),
    startDate: state.getIn(['pages', 'overview', 'data', 'startDate']),
    currentDate: state.getIn(['pages', 'overview', 'data', 'currentDate']),
    graphWidth: Math.min(state.getIn(['other', 'windowWidth']), GRAPH_WIDTH),
    valuesNet: state.getIn(['pages', 'overview', 'data', 'cost', 'net']),
    valuesSpending: state.getIn(['pages', 'overview', 'data', 'cost', 'spending']),
    futureMonths: state.getIn(['pages', 'overview', 'data', 'futureMonths']),
    cost: state.getIn(['pages', 'overview', 'data', 'cost']),
    showAll: state.getIn(['other', 'showAllBalanceGraph']),
    targets: getTargets(state)
});

const mapDispatchToProps = dispatch => ({
    onShowAll: () => dispatch(aShowAllToggled())
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphOverview);

