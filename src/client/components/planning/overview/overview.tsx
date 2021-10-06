import React from 'react';

import { PlanningOverviewRow, useOverviewData } from '../hooks/overview';
import * as Styled from './styles';

import { formatCurrency } from '~client/modules/format';
import { H4 } from '~client/styled/shared';

const Row: React.FC<PlanningOverviewRow> = ({ name, value, isBold }) =>
  value ? (
    <Styled.OverviewRow isBold={isBold}>
      <Styled.OverviewName>{name}</Styled.OverviewName>
      <Styled.OverviewValue>{formatCurrency(value)}</Styled.OverviewValue>
    </Styled.OverviewRow>
  ) : null;

export const PlanningOverview: React.FC = () => {
  const rows = useOverviewData();
  return (
    <Styled.PlanningOverview>
      <H4>Overview</H4>
      {rows.map((row) => (
        <Row key={row.name} {...row} />
      ))}
    </Styled.PlanningOverview>
  );
};
