import endOfDay from 'date-fns/endOfDay';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as Styled from './styles';
import { errorOpened } from '~client/actions';
import { GraphBalance } from '~client/components/graph-balance';
import { GraphSpending } from '~client/components/graph-spending';
import { ErrorLevel } from '~client/constants/error';
import { TodayContext, useIsMobile } from '~client/hooks';
import { useOverviewOldQuery } from '~client/hooks/gql';
import { getFutureMonths, getProcessedMonthlyValues, getStartDate } from '~client/selectors';
import type { MergedMonthly } from '~client/types';

export const GraphOverview: React.FC = () => {
  const dispatch = useDispatch();
  const today = useContext(TodayContext);

  const startDateCurrent = useSelector(getStartDate);
  const futureMonths = useSelector(getFutureMonths(today));

  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState<boolean>(false);
  const [{ data: oldData, fetching, error }, fetchOld] = useOverviewOldQuery({
    pause: true,
  });

  const showAllAndReady = showAll && !!oldData?.overviewOld;

  const monthly = useSelector(
    getProcessedMonthlyValues(
      today,
      showAllAndReady ? oldData?.overviewOld?.stocks.length ?? 0 : 0,
    ),
  );

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(`Error loading old overview data: ${error.message}`, ErrorLevel.Err));
    }
  }, [error, dispatch]);

  const mergedMonthly = useMemo<MergedMonthly>(() => {
    const overviewOld = showAllAndReady ? oldData?.overviewOld : undefined;
    if (!overviewOld) {
      return { ...monthly.values, startPredictionIndex: monthly.startPredictionIndex };
    }

    const mergedData: Omit<MergedMonthly, 'net'> = {
      startPredictionIndex: monthly.startPredictionIndex + overviewOld.netWorth.length,
      assets: [...overviewOld.assets, ...monthly.values.assets],
      liabilities: [...overviewOld.liabilities, ...monthly.values.liabilities],
      netWorth: [...overviewOld.netWorth, ...monthly.values.netWorth],
      stocks: [...overviewOld.stocks, ...monthly.values.stocks],
      stockCostBasis: monthly.values.stockCostBasis,
      pension: [...overviewOld.pension, ...monthly.values.pension],
      cashOther: [...overviewOld.cashOther, ...monthly.values.cashOther],
      investments: [...overviewOld.investments, ...monthly.values.investments],
      homeEquity: [...overviewOld.homeEquity, ...monthly.values.homeEquity],
      options: [...overviewOld.options, ...monthly.values.options],
      income: [...overviewOld.income, ...monthly.values.income],
      spending: [...overviewOld.spending, ...monthly.values.spending],
    };

    const mergedNet = mergedData.income.map((value, index) => value - mergedData.spending[index]);

    return { ...mergedData, net: mergedNet };
  }, [showAllAndReady, oldData, monthly]);

  const startDate = useMemo<Date>(
    () =>
      showAllAndReady
        ? endOfDay(new Date(oldData?.overviewOld?.startDate ?? startDateCurrent))
        : startDateCurrent,
    [startDateCurrent, showAllAndReady, oldData],
  );

  useEffect(() => {
    if (showAll) {
      fetchOld({ requestPolicy: 'cache-and-network' });
    }
  }, [showAll, fetchOld]);

  return (
    <Styled.GraphOverview data-testid="graph-overview">
      <GraphBalance
        isMobile={isMobile}
        showAll={showAllAndReady}
        setShowAll={setShowAll}
        isLoading={fetching && !showAllAndReady}
        startDate={startDate}
        futureMonths={futureMonths}
        monthly={mergedMonthly}
      />
      {!isMobile && (
        <GraphSpending
          startDate={startDate}
          futureMonths={futureMonths}
          monthly={mergedMonthly}
          showAll={showAllAndReady}
        />
      )}
    </Styled.GraphOverview>
  );
};
