import { useEffect, useMemo, useRef, useState } from 'react';

import type { SelectOptions } from '~client/components/form-field';
import { highlightTimeMs } from '~client/components/fund-gain-info/styles';
import { useUpdateEffect } from '~client/hooks';
import { FundMode } from '~client/types/enum';

type Highlight = {
  value: -1 | 1 | 0;
  comparePrice: number;
};

function getHighlight(comparePrice: number, newPrice: number): Highlight['value'] {
  if (!(comparePrice && newPrice) || comparePrice === newPrice) {
    return 0;
  }
  return newPrice > comparePrice ? 1 : -1;
}

export function usePriceChangeHighlight(
  latestPrice: number,
  initialPrice?: number,
): Highlight['value'] {
  const [highlight, setHighlight] = useState<Highlight>({
    value: 0,
    comparePrice: initialPrice ?? latestPrice,
  });
  const timer = useRef<number>(0);

  useEffect(() => {
    if (typeof initialPrice !== 'undefined') {
      setHighlight((last) => ({ ...last, comparePrice: initialPrice }));
    }
  }, [initialPrice]);

  useUpdateEffect(() => {
    setHighlight((last) => ({
      value: getHighlight(last.comparePrice, latestPrice),
      comparePrice: latestPrice,
    }));

    timer.current = window.setTimeout(() => {
      setHighlight((last) => ({ ...last, value: 0 }));
    }, highlightTimeMs + 100);

    return (): void => {
      clearTimeout(timer.current);
    };
  }, [latestPrice]);

  return highlight.value;
}

const modeListDesktop = Object.values(FundMode);
const modeListMobile = [FundMode.Roi, FundMode.Value];

export function useFundModeList(isMobile: boolean): FundMode[] {
  return isMobile ? modeListMobile : modeListDesktop;
}

const fundModeText: Partial<Record<FundMode, string>> = {
  [FundMode.Stacked]: 'Value (stacked)',
  [FundMode.PriceNormalised]: 'Price (normalised)',
};

export function useFundModeSelectOptions(isMobile: boolean): SelectOptions<FundMode> {
  const modeList = useFundModeList(isMobile);
  return useMemo<SelectOptions<FundMode>>(
    () => modeList.map((internal) => ({ internal, external: fundModeText[internal] })),
    [modeList],
  );
}
