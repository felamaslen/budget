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

  const { state, setState, isSynced, isLoading, error } = usePlanning();
  const year = useYear(match.params.year);
  useEffect(() => {
    if (!match.params.year) {
      history.replace(`/planning/${year}`);
    }
  }, [history, match.params.year, year]);

  const tableData = usePlanningTableData(state, year);

  const context = useMemo<PlanningContextState>(
    () => ({
      state,
      year,
      isSynced,
      isLoading,
      error,
      table: tableData,
    }),
    [state, year, isSynced, isLoading, error, tableData],
  );

  return (
    <PlanningContextDispatch.Provider value={setState}>
      <PlanningContext.Provider value={context}>
        <Styled.PlanningWrapper>
          <Styled.Planning>
            <Table />
            {!isMobile && <PlanningOverview />}
            <Sidebar />
            <PlanningPieChart />
          </Styled.Planning>
          <Status />
        </Styled.PlanningWrapper>
      </PlanningContext.Provider>
    </PlanningContextDispatch.Provider>
  );
};
export default PagePlanning;
