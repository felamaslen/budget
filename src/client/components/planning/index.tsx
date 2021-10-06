import React, { useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router';

import { initialLocalState, PlanningContext, PlanningContextDispatch } from './context';
import { usePlanning, usePlanningTableData } from './hooks';
import { PlanningOverview } from './overview/overview';
import { PlanningPieChart } from './pie/pie';
import { Sidebar } from './sidebar';
import { Status } from './status/status';
import * as Styled from './styles';
import { Table } from './table';
import type { LocalState, PlanningContextState, PlanningDispatch } from './types';

import { useIsMobile } from '~client/hooks';

const PagePlanning: React.FC<RouteComponentProps> = () => {
  const isMobile = useIsMobile();

  const { state, setState, isSynced, isLoading, error } = usePlanning();
  const [localState, setLocalState] = useState<LocalState>(initialLocalState);

  const tableData = usePlanningTableData(state, localState.year);

  const context = useMemo<PlanningContextState>(
    () => ({
      state,
      isSynced,
      isLoading,
      error,
      local: localState,
      table: tableData,
    }),
    [state, localState, isSynced, isLoading, error, tableData],
  );

  const dispatch = useMemo<PlanningDispatch>(
    () => ({
      local: setLocalState,
      sync: setState,
    }),
    [setLocalState, setState],
  );

  return (
    <PlanningContextDispatch.Provider value={dispatch}>
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
