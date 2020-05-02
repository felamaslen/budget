import React from 'react';

import { Period, Grouping } from '~client/constants/analysis';

import * as Styled from './styles';

type Props = {
  period: Period;
  grouping: Grouping;
  page: number;
  description: string;
  onRequest: (request: { period?: Period; grouping?: Grouping; page?: number }) => void;
};

const Upper: React.FC<Props> = ({ period, grouping, page, description, onRequest }) => (
  <Styled.Upper>
    <Styled.Input>
      <span>{'Period:'}</span>
      {(Object.keys(Period) as Period[]).map(value => (
        <span key={value}>
          <input
            type="radio"
            checked={value === period}
            onChange={(): void => onRequest({ period: value })}
            data-testid={`input-period-${value}`}
          />
          <span>{value}</span>
        </span>
      ))}
    </Styled.Input>
    <Styled.Input>
      <span>{'Grouping:'}</span>
      {(Object.keys(Grouping) as Grouping[]).map(value => (
        <span key={value}>
          <input
            type="radio"
            checked={value === grouping}
            onChange={(): void => onRequest({ grouping: value })}
            data-testid={`input-grouping-${value}`}
          />
          <span>{value}</span>
        </span>
      ))}
    </Styled.Input>
    <Styled.Buttons>
      <Styled.Button onClick={(): void => onRequest({ page: page + 1 })}>Previous</Styled.Button>
      <Styled.Button disabled={page === 0} onClick={(): void => onRequest({ page: page - 1 })}>
        Next
      </Styled.Button>
    </Styled.Buttons>
    <Styled.PeriodTitle>{description}</Styled.PeriodTitle>
  </Styled.Upper>
);

export default React.memo(Upper);
