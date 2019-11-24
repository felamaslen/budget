import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import Media from 'react-media';

import { targetsShape } from '~client/prop-types/graph/balance';
import { costShape } from '~client/prop-types/page/overview';

import { getTargets } from '~client/selectors/graph';
import { getProcessedCost } from '~client/selectors/overview';
import { getNetWorthSummaryOld } from '~client/selectors/overview/net-worth';
import { getStartDate, getFutureMonths } from '~client/selectors/overview/common';
import { getCurrentDate } from '~client/selectors/now';

import { mediaQueryMobile } from '~client/constants';
import { GRAPH_WIDTH } from '~client/constants/graph';
import GraphBalance from '~client/components/GraphBalance';
import GraphSpending from '~client/components/GraphSpending';

import * as Styled from './styles';

const GraphOverviewWrapped = ({ futureMonths, cost, netWorthOld, targets, ...commonProps }) => (
    <Styled.GraphOverview>
        <GraphBalance
            name="balance"
            {...commonProps}
            futureMonths={futureMonths}
            cost={cost}
            netWorthOld={netWorthOld}
            targets={targets}
        />
        {!commonProps.isMobile && (
            <GraphSpending
                name="spend"
                {...commonProps}
                valuesNet={cost.net}
                valuesSpending={cost.spending}
            />
        )}
    </Styled.GraphOverview>
);

GraphOverviewWrapped.propTypes = {
    isMobile: PropTypes.bool,
    startDate: PropTypes.instanceOf(DateTime).isRequired,
    now: PropTypes.instanceOf(DateTime).isRequired,
    futureMonths: PropTypes.number.isRequired,
    cost: costShape.isRequired,
    netWorthOld: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    targets: targetsShape.isRequired,
    graphWidth: PropTypes.number.isRequired,
};

function GraphOverview(props) {
    return (
        <Media query={mediaQueryMobile}>
            {isMobile => <GraphOverviewWrapped isMobile={isMobile} {...props} />}
        </Media>
    );
}

const mapStateToProps = state => ({
    now: getCurrentDate(state),
    startDate: getStartDate(state),
    graphWidth: Math.min(state.app.windowWidth, GRAPH_WIDTH),
    cost: getProcessedCost(state),
    netWorthOld: getNetWorthSummaryOld(state),
    futureMonths: getFutureMonths(state),
    targets: getTargets(state),
});

export default connect(mapStateToProps)(GraphOverview);
