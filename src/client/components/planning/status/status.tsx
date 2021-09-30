import { css } from '@emotion/react';
import { rem } from 'polished';
import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { useSelector } from 'react-redux';
import DotLoader from 'react-spinners/DotLoader';

import { numYearsToPlan } from '../constants';
import { getFinancialYear } from '../utils';

import * as Styled from './styles';

import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { useToday } from '~client/hooks';
import { getStartDate } from '~client/selectors';

export type Props = {
  showSpinner: boolean;
  year: number;
  setYear: Dispatch<SetStateAction<number>>;
};

const spinnerOverride = css`
  position: absolute;
  margin: ${rem(4)};
  right: 0;
`;

export const Status: React.FC<Props> = ({ showSpinner, year, setYear }) => {
  const startDate = useSelector(getStartDate);
  const startFinancialYear = getFinancialYear(startDate);
  const today = useToday();
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
      <FormFieldSelect options={yearOptions} value={year} onChange={setYear} />
      {showSpinner && <DotLoader size={18} css={spinnerOverride} />}
    </Styled.StatusBar>
  );
};
