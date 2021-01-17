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

  const monthly = useSelector(getProcessedMonthlyValues(today));
  const startDateCurrent = useSelector(getStartDate);
  const futureMonths = useSelector(getFutureMonths(today));

  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState<boolean>(false);

  const [{ data: oldData, fetching, error }, fetchOld] = useOverviewOldQuery({
    pause: true,
  });

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(`Error loading old overview data: ${error.message}`, ErrorLevel.Err));
    }
  }, [error, dispatch]);

  const mergedMonthly = useMemo<MergedMonthly>(() => {
    if (!(showAll && oldData?.overviewOld)) {
      return monthly;
    }

    const mergedData: Omit<MergedMonthly, 'net'> = {
      netWorth: [...oldData.overviewOld.netWorth, ...monthly.netWorth],
      stocks: [...oldData.overviewOld.stocks, ...monthly.stocks],
      pension: [...oldData.overviewOld.pension, ...monthly.pension],
      cashOther: [...oldData.overviewOld.cashOther, ...monthly.cashOther],
      investments: [...oldData.overviewOld.investments, ...monthly.investments],
      homeEquity: [...oldData.overviewOld.homeEquity, ...monthly.homeEquity],
      options: [...oldData.overviewOld.options, ...monthly.options],
      income: [...oldData.overviewOld.income, ...monthly.income],
      spending: [...oldData.overviewOld.spending, ...monthly.spending],
    };

    const mergedNet = mergedData.income.map((value, index) => value - mergedData.spending[index]);

    return { ...mergedData, net: mergedNet };
  }, [showAll, oldData, monthly]);

  const startDate = useMemo<Date>(
    () =>
      showAll && oldData
        ? new Date(oldData.overviewOld?.startDate ?? startDateCurrent)
        : startDateCurrent,
    [startDateCurrent, showAll, oldData],
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
        showAll={showAll}
        setShowAll={setShowAll}
        isLoading={fetching}
        startDate={startDate}
        futureMonths={futureMonths}
        monthly={mergedMonthly}
      />
      {!isMobile && (
        <GraphSpending
          startDate={startDate}
          futureMonths={futureMonths}
          monthly={mergedMonthly}
          showAll={showAll}
        />
      )}
    </Styled.GraphOverview>
  );
};
