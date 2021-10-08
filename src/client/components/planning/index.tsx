import React, { useEffect, useMemo } from 'react';
import type { RouteComponentProps } from 'react-router';

import { PlanningContext, PlanningContextDispatch } from './context';
import { usePlanning, usePlanningTableData, useYear } from './hooks';
import { PlanningOverview } from './overview/overview';
import { PlanningPieChart } from './pie/pie';
import { Sidebar } from './sidebar';
import { Status } from './status/status';
import * as Styled from './styles';
import { Table } from './table';
import type { PlanningContextState } from './types';

import { useIsMobile } from '~client/hooks';

const PagePlanning: React.FC<RouteComponentProps<{ year?: string }>> = ({ history, match }) => {
  const isMobile = useIsMobile();

  const year = useYear(match.params.year);
  const { state, setState, isSynced, isLoading, error } = usePlanning(year);
  useEffect(() => {
    if (!match.params.year) {
      history.replace(`/planning/${year}`);
    }
  }, [history, match.params.year, year]);

  const tableData = usePlanningTableData(state);

  const context = useMemo<PlanningContextState>(
    () => ({
      state,
      localYear: year,
      isSynced,
      isLoading,
      error,
      table: tableData,
    }),
    [state, year, isSynced, isLoading, error, tableData],
  );

  const isLoadingYear = state.year !== year;

  return (
    <PlanningContextDispatch.Provider value={setState}>
      <PlanningContext.Provider value={context}>
        <Styled.PlanningWrapper>
          <Styled.Planning>
            <Table />
            {!isMobile && <PlanningOverview />}
            <Sidebar />
            <PlanningPieChart />
            {isLoadingYear && <Styled.LoadingYearOverlay />}
          </Styled.Planning>
          <Status />
        </Styled.PlanningWrapper>
      </PlanningContext.Provider>
    </PlanningContextDispatch.Provider>
  );
};
export default PagePlanning;
