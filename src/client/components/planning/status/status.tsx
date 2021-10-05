import { css } from '@emotion/react';
import { rem } from 'polished';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import DotLoader from 'react-spinners/DotLoader';

import { numYearsToPlan } from '../constants';
import { usePlanningContext, usePlanningDispatch } from '../context';
import { getFinancialYear } from '../utils';

import * as Styled from './styles';

import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { useToday } from '~client/hooks';
import { getStartDate } from '~client/selectors';

const spinnerOverride = css`
  position: absolute;
  margin: ${rem(4)};
  right: 0;
`;

export const Status: React.FC = () => {
  const startDate = useSelector(getStartDate);
  const startFinancialYear = getFinancialYear(startDate);
  const today = useToday();

  const { local, isSynced, isLoading } = usePlanningContext();
  const { local: dispatchLocal } = usePlanningDispatch();
  const setYear = useCallback((year: number) => dispatchLocal((last) => ({ ...last, year })), [
    dispatchLocal,
  ]);
  const showSpinner = !isSynced || isLoading;

  const years = useMemo<number[]>(
    () =>
      Array(Math.max(0, getFinancialYear(today) - startFinancialYear + 1 + numYearsToPlan))
        .fill(0)
        .map((_, index) => startFinancialYear + index),
    [startFinancialYear, today],
  );

  const yearOptions = useMemo<SelectOptions<number>>(
    () =>
      years.map((financialYear) => ({
        internal: financialYear,
        external: `FY ${financialYear - 2000}/${financialYear - 2000 + 1}`,
      })),
    [years],
  );

  return (
    <Styled.StatusBar>
      <FormFieldSelect options={yearOptions} value={local.year} onChange={setYear} />
      {showSpinner && <DotLoader size={18} css={spinnerOverride} />}
    </Styled.StatusBar>
  );
};
