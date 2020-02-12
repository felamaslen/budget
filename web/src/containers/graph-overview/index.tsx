import { connect } from 'react-redux';
import React from 'react';
import { DateTime } from 'luxon';
import Media from 'react-media';

import { costShape } from '~client/prop-types/page/overview';
import { State } from '~client/reducers';

import { getTargets } from '~client/selectors/graph';
import { getProcessedCost } from '~client/selectors/overview';
import { getNetWorthSummaryOld } from '~client/selectors/overview/net-worth';
import { getStartDate, getFutureMonths } from '~client/selectors/overview/common';
import { getCurrentDate } from '~client/selectors/now';

import { mediaQueryMobile } from '~client/constants';
import { GRAPH_WIDTH } from '~client/constants/graph';
import { GraphBalance, Props as BalanceProps } from '~client/components/graph-balance';
import { GraphSpending } from '~client/components/graph-spending';
import { Props as CommonProps } from '~client/components/graph-cashflow';
import { Cost } from '~client/types/overview';
import { Target } from '~client/types/overview';

import * as Styled from './styles';

type Props = BalanceProps & Omit<CommonProps, 'name' | 'lines'>;

export const GraphOverviewWrapped: React.FC<Props> = ({
    futureMonths,
    cost,
    netWorthOld,
    targets,
    ...commonProps
}) => (
    <Styled.GraphOverview>
        <GraphBalance
            {...commonProps}
            futureMonths={futureMonths}
            cost={cost}
            netWorthOld={netWorthOld}
            targets={targets}
        />
        {!commonProps.isMobile && (
            <GraphSpending {...commonProps} valuesNet={cost.net} valuesSpending={cost.spending} />
        )}
    </Styled.GraphOverview>
);

const GraphOverview: React.FC<Props> = props => (
    <Media query={mediaQueryMobile}>
        {(isMobile: boolean): React.ReactNode => (
            <GraphOverviewWrapped isMobile={isMobile} {...props} />
        )}
    </Media>
);

const mapStateToProps = (state: State): Props => ({
    now: getCurrentDate(state),
    startDate: getStartDate(state),
    graphWidth: Math.min(state.app.windowWidth, GRAPH_WIDTH),
    cost: getProcessedCost(state),
    netWorthOld: getNetWorthSummaryOld(state),
    futureMonths: getFutureMonths(state),
    targets: getTargets(state),
});

export default connect(mapStateToProps)(GraphOverview);
