import React from 'react';

import { Query } from './hooks';
import * as Styled from './styles';

import { Spinner } from '~client/components/spinner';
import { AnalysisPeriod, AnalysisGroupBy } from '~client/types';

export type Props = {
  period: AnalysisPeriod;
  groupBy: AnalysisGroupBy;
  page: number;
  description: string;
  loading: boolean;
  onRequest: (request: Partial<Query>) => void;
};

const Upper: React.FC<Props> = ({ period, groupBy, page, description, loading, onRequest }) => (
  <Styled.Upper>
    <Styled.Input>
      <span>{'Period:'}</span>
      {Object.values(AnalysisPeriod).map((value) => (
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
      <span>{'Group by:'}</span>
      {Object.values(AnalysisGroupBy).map((value) => (
        <span key={value}>
          <input
            type="radio"
            checked={value === groupBy}
            onChange={(): void => onRequest({ groupBy: value })}
            data-testid={`input-groupby-${value}`}
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
    {loading && <Spinner size={0.5} />}
    <Styled.PeriodTitle>{description}</Styled.PeriodTitle>
  </Styled.Upper>
);

export default React.memo(Upper);
