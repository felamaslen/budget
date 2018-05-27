import './style.scss';
import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { aShowAllToggled } from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueryMobile } from '../../constants';
import { getNow } from '../../helpers/date';
import { GRAPH_WIDTH } from '../../constants/graph';
import GraphBalance from '../../components/GraphBalance';
import GraphSpending from '../../components/GraphSpending';

export function GraphOverviewWrapped({
    valuesNet, valuesSpending, futureMonths, cost, showAll, targets, ...props
}) {
    const now = getNow();

    let graphSpending = null;
    if (!props.isMobile) {
        graphSpending = (
            <GraphSpending name="spend"
                now={now}
                {...props}
                valuesNet={valuesNet}
                valuesSpending={valuesSpending}
            />
        );
    }

    return (
        <div className="graph-container-outer">
            <GraphBalance name="balance"
                now={now}
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

const getTargetsData = state => state.getIn(['pages', 'overview', 'data']);

const getTargets = createSelector([getTargetsData], data => {
    const periods = list([
        { last: 3, months: 12, tag: '1y' },
        { last: 6, months: 36, tag: '3y' },
        { last: 12, months: 60, tag: '5y' }
    ]);

    const futureMonths = data.get('futureMonths');

    const values = data.getIn(['cost', 'balance'])
        .slice(0, -futureMonths)
        .reverse();

    const currentValue = values.first();

    return periods.map(({ last, months, tag }) => {
        const from = data.getIn(['cost', 'balance', -(futureMonths + 1 + last)]);

        const date = data.getIn(['dates', -(futureMonths + 1 + last)]).ts / 1000;

        const value = from + (currentValue - from) * (months + last) / last;

        return map({ date, from, months, last, tag, value });
    });
});

const mapStateToProps = state => ({
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

