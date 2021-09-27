import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as Styled from './styles';
import { errorOpened } from '~client/actions';
import { GraphBalance } from '~client/components/graph-balance';
import type { GraphCashFlowTitle } from '~client/components/graph-cashflow/types';
import { GraphSpending } from '~client/components/graph-spending';
import { ErrorLevel } from '~client/constants/error';
import { useIsMobile, usePersistentState, useToday } from '~client/hooks';
import { useOverviewOldQuery } from '~client/hooks/gql';
import { getMonthDatesList } from '~client/modules/date';
import {
  getInitialCumulativeValues,
  getLongTermRates,
  getOverviewGraphValues,
} from '~client/selectors';
import { longTermOptionsDisabled } from '~client/selectors/overview/utils';
import type { LongTermOptions, OverviewGraph } from '~client/types';

export const GraphOverview: React.FC = () => {
  const dispatch = useDispatch();
  const today = useToday();

  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState<boolean>(false);
  const [longTermOptions, setLongTermOptions] = usePersistentState<LongTermOptions>(
    longTermOptionsDisabled,
    'long-term-options',
  );
  const defaultRates = useSelector(getLongTermRates(today));
  const [{ data: oldData, fetching, error }, fetchOld] = useOverviewOldQuery({
    pause: true,
  });

  const showAllAndReady = showAll && !!oldData?.overviewOld;

  const graph = useSelector(
    getOverviewGraphValues(
      today,
      showAllAndReady ? oldData?.overviewOld?.stocks.length ?? 0 : 0,
      longTermOptions,
    ),
  );
  const initialCumulativeValues = useSelector(getInitialCumulativeValues);

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(`Error loading old overview data: ${error.message}`, ErrorLevel.Err));
    }
  }, [error, dispatch]);

  const mergedGraph = useMemo<OverviewGraph>((): OverviewGraph => {
    const overviewOld = showAllAndReady ? oldData?.overviewOld : undefined;
    if (!overviewOld) {
      return graph;
    }

    const income: number[] = [...overviewOld.income, ...graph.values.income];
    const spending: number[] = [...overviewOld.spending, ...graph.values.spending];
    const net = income.map<number>((value, index) => value - spending[index]);

    const result: OverviewGraph = {
      dates: getMonthDatesList(
        endOfMonth(new Date(overviewOld.startDate)),
        endOfMonth(addMonths(graph.dates[0], -1)),
      ).concat(graph.dates),
      startPredictionIndex: graph.startPredictionIndex + overviewOld.netWorth.length,
      values: {
        ...graph.values,
        assets: [...overviewOld.assets, ...graph.values.assets],
        liabilities: [...overviewOld.liabilities, ...graph.values.liabilities],
        netWorth: [...overviewOld.netWorth, ...graph.values.netWorth],
        stocks: [...overviewOld.stocks, ...graph.values.stocks],
        stockCostBasis: graph.values.stockCostBasis,
        pension: [...overviewOld.pension, ...graph.values.pension],
        cashLiquid: [...overviewOld.cashLiquid, ...graph.values.cashLiquid],
        cashOther: [...overviewOld.cashOther, ...graph.values.cashOther],
        investments: [...overviewOld.investments, ...graph.values.investments],
        investmentPurchases: [
          ...overviewOld.investmentPurchases,
          ...graph.values.investmentPurchases,
        ],
        illiquidEquity: [...overviewOld.illiquidEquity, ...graph.values.illiquidEquity],
        options: [...overviewOld.options, ...graph.values.options],
        income,
        spending,
        net,
      },
    };

    return result;
  }, [showAllAndReady, oldData, graph]);

  const stockAndInvestmentPurchases = useMemo<number[]>(
    () =>
      mergedGraph.values.income.map<number>((_, index) => {
        const stockPurchases =
          mergedGraph.values.stockCostBasis[index] -
          (index > 0 ? mergedGraph.values.stockCostBasis[index - 1] : 0);
        const investmentPurchases = mergedGraph.values.investmentPurchases[index];
        return stockPurchases + investmentPurchases;
      }),
    [mergedGraph],
  );

  useEffect(() => {
    if (showAll) {
      fetchOld({ requestPolicy: 'cache-and-network' });
    }
  }, [showAll, fetchOld]);

  const [mobileGraph, setMobileGraph] = useState<GraphCashFlowTitle>('Net worth');

  return (
    <Styled.GraphOverview data-testid="graph-overview">
      {(!isMobile || mobileGraph === 'Net worth') && (
        <GraphBalance
          isMobile={isMobile}
          showAll={showAllAndReady}
          setShowAll={setShowAll}
          isLoading={fetching && !showAllAndReady}
          graph={mergedGraph}
          longTermOptions={longTermOptions}
          setLongTermOptions={setLongTermOptions}
          defaultRates={defaultRates}
          setMobileGraph={setMobileGraph}
        />
      )}
      {(!isMobile || mobileGraph === 'Cash flow') && (
        <GraphSpending
          isMobile={isMobile}
          graph={mergedGraph}
          initialCumulativeValues={initialCumulativeValues}
          investments={stockAndInvestmentPurchases}
          showAll={showAllAndReady}
          setShowAll={setShowAll}
          longTerm={longTermOptions.enabled}
          setMobileGraph={setMobileGraph}
        />
      )}
    </Styled.GraphOverview>
  );
};
