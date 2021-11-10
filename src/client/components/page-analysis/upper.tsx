import { css } from '@emotion/react';
import { rem } from 'polished';
import React from 'react';
import DotLoader from 'react-spinners/DotLoader';

import { Query } from './hooks';
import { SankeyIcon } from './sankey-icon';
import * as Styled from './styles';

import { AnalysisPeriod, AnalysisGroupBy } from '~client/types/enum';

export type Props = {
  period: AnalysisPeriod;
  groupBy: AnalysisGroupBy;
  page: number;
  description: string;
  loading: boolean;
  onRequest: (request: Partial<Query>) => void;
  onOpenSankey: () => void;
};

const spinnerOverride = css`
  position: absolute;
  right: ${rem(4)};
  top: ${rem(4)};
`;

const Upper: React.FC<Props> = ({
  period,
  groupBy,
  page,
  description,
  loading,
  onOpenSankey,
  onRequest,
}) => (
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
    <DotLoader loading={loading} size={22} css={spinnerOverride} />
    <Styled.PeriodTitle>
      {description}{' '}
      <Styled.ButtonSankey onClick={onOpenSankey}>
        <SankeyIcon />
      </Styled.ButtonSankey>
    </Styled.PeriodTitle>
  </Styled.Upper>
);

export default React.memo(Upper);
