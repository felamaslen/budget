import { useCallback } from 'react';

import type { LabelY } from '../graph/time-axes';

import { formatValue } from '~client/modules/funds';
import type { FundModeLine } from '~client/types';
import { FundMode } from '~client/types/gql';

export const isLineMode = (mode: FundMode): mode is FundModeLine =>
  ![FundMode.Calendar, FundMode.Candlestick].includes(mode);

export const useLabelY = (mode: FundMode): LabelY =>
  useCallback((value) => formatValue(value, mode), [mode]);
