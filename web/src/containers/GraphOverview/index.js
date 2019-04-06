import './style.scss';
import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import Media from 'react-media';
import { mediaQueryMobile } from '~client/constants';
import { getTargets } from '~client/selectors/graph';
import { getCurrentDate, getStartDate, getFutureMonths, getProcessedCost } from '~client/selectors/overview';
import { GRAPH_WIDTH } from '~client/constants/graph';
import GraphBalance from '~client/components/GraphBalance';
import GraphSpending from '~client/components/GraphSpending';

export function GraphOverviewWrapped({ isMobile, startDate, now, futureMonths, cost, targets, graphWidth }) {
    const commonProps = { isMobile, startDate, now, graphWidth };

    return (
        <div className="graph-container-outer">
            <GraphBalance name="balance"
                {...commonProps}
                futureMonths={futureMonths}
                cost={cost}
                targets={targets}
            />
            {!isMobile && (
                <GraphSpending name="spend"
                    {...commonProps}
                    valuesNet={cost.get('net')}
                    valuesSpending={cost.get('spending')}
                />
            )}
        </div>
    );
}

GraphOverviewWrapped.propTypes = {
    isMobile: PropTypes.bool,
    startDate: PropTypes.instanceOf(DateTime).isRequired,
    now: PropTypes.instanceOf(DateTime).isRequired,
    futureMonths: PropTypes.number.isRequired,
    cost: PropTypes.instanceOf(map).isRequired,
    targets: PropTypes.instanceOf(list).isRequired,
    graphWidth: PropTypes.number.isRequired
};

function GraphOverview(props) {
    return (
        <Media query={mediaQueryMobile}>
            {isMobile => (
                <GraphOverviewWrapped isMobile={isMobile} {...props} />
            )}
        </Media>
    );
}

const mapStateToProps = state => ({
    now: getCurrentDate(state),
    startDate: getStartDate(state),
    graphWidth: Math.min(state.getIn(['other', 'windowWidth']), GRAPH_WIDTH),
    cost: getProcessedCost(state),
    futureMonths: getFutureMonths(state),
    targets: getTargets(state)
});

export default connect(mapStateToProps)(GraphOverview);

