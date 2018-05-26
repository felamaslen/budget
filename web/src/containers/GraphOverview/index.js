import './style.scss';
import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aShowAllToggled } from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { DateTime } from 'luxon';
import { mediaQueryMobile } from '../../constants';
import { GRAPH_WIDTH } from '../../constants/graph';
import { getNow } from '../../helpers/date';
import { listAverage } from '../../helpers/data';
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

function getTargets(state) {
    const periods = list([
        { last: 3, months: 12, tag: '1y' },
        { last: 6, months: 36, tag: '3y' },
        { last: 12, months: 60, tag: '5y' }
    ]);

    const values = state.getIn(['pages', 'overview', 'data', 'cost', 'balance'])
        .slice(0, -state.getIn(['pages', 'overview', 'data', 'futureMonths']))
        .reverse();

    const currentValue = values.first();

    const saved = values.slice(0, values.size - 1)
        .map((value, index) => value - values.get(index + 1));

    const averageValue = last => listAverage(saved.slice(0, last));

    return periods.map(({ last, months, tag }) => map({
        tag,
        value: currentValue + averageValue(last) * months
    }));
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
        targets: getTargets(state)
    }
});

const mapDispatchToProps = dispatch => ({
    onShowAll: () => dispatch(aShowAllToggled())
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphOverview);

