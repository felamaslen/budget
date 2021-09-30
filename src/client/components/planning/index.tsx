import getYear from 'date-fns/getYear';
import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router';

import { PlanningContextSetState, PlanningContextState } from './context';
import { usePlanning, usePlanningData } from './hooks';
import { Months } from './months';
import { Sidebar } from './sidebar';
import { Status } from './status/status';
import * as Styled from './styles';

import { useToday } from '~client/hooks';

const PagePlanning: React.FC<RouteComponentProps> = () => {
  const today = useToday();
  const { state, setState, isSynced, isLoading } = usePlanning();

  const [year, setYear] = useState<number>(getYear(today));

  const planningData = usePlanningData(state, year);

  return (
    <PlanningContextState.Provider value={state}>
      <PlanningContextSetState.Provider value={setState}>
        <Styled.Planning>
          <Months year={year} planningData={planningData} />
          <Sidebar year={year} />
        </Styled.Planning>
        <Status showSpinner={!isSynced || isLoading} year={year} setYear={setYear} />
      </PlanningContextSetState.Provider>
    </PlanningContextState.Provider>
  );
};
export default PagePlanning;
