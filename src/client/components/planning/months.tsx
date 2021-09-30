import React from 'react';

import { Header } from './header';
import { Month } from './month';
import * as Styled from './styles';
import type { PlanningData } from './types';

export type Props = {
  year: number;
  planningData: PlanningData[];
};

export const Months: React.FC<Props> = ({ year, planningData }) => (
  <Styled.Table>
    <Header />
    <Styled.Body>
      {planningData.map((dataForMonth, index) => (
        <Month
          key={`${year}-${dataForMonth.month}`}
          year={year}
          dataForMonth={dataForMonth}
          isStart={index === 0}
        />
      ))}
    </Styled.Body>
  </Styled.Table>
);
