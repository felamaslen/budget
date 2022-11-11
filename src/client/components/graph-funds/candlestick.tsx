import getUnixTime from 'date-fns/getUnixTime';
import { setLightness } from 'polished';
import { ComponentProps, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { replaceAtIndex } from 'replace-array';

import { genPixelCompute } from '../graph/helpers';
import { Graph } from '../graph/shared';
import { TimeAxes } from '../graph/time-axes';
import { useLabelY } from './utils';

import { GRAPH_FUNDS_NUM_TICKS } from '~client/constants';
import { useNow } from '~client/hooks';
import { formatCurrency, getTickSize } from '~client/modules/format';
import { getFundsCachedValue } from '~client/selectors';
import { colors } from '~client/styled';
import type { Calc, Dimensions, DrawProps, HistoryOptions, Padding, Range } from '~client/types';
import {
  FundHistoryCandlestickGroup,
  FundMode,
  useFundHistoryCandlestickQuery,
} from '~client/types/gql';

const Candlestick: React.ComponentType<{
  calc: Calc;
  ranges: Range;
  stick: FundHistoryCandlestickGroup;
}> = ({ calc, ranges, stick }) => {
  const bottom = calc.pixY1(ranges.minY);

  const x0 = calc.pixX(stick.t0) + 1;
  const candleWidth = calc.pixX(stick.t1) - x0 - 2;

  const rectMax = Math.max(stick.start, stick.end);
  const rectMin = Math.min(stick.start, stick.end);

  const rectY = calc.pixY1(rectMax);
  const rectHeight = Math.max(1, calc.pixY1(rectMin) - rectY);

  const maxY = calc.pixY1(stick.max);
  const minY = calc.pixY1(stick.min);

  const fillColor = stick.end >= stick.start ? colors.income.main : colors.loss.dark;

  const [highlight, setHighlight] = useState(false);

  const onMouseOver = useCallback(() => setHighlight(true), []);
  const onMouseOut = useCallback(() => setHighlight(false), []);

  const labelWidth = 100;
  const labelX = Math.min(calc.pixX(ranges.maxX) - labelWidth / 2, Math.max(labelWidth / 2, x0));

  return (
    <g onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <rect
        x={x0}
        y={rectY}
        height={rectHeight}
        width={candleWidth}
        fill={highlight ? setLightness(0.3, fillColor) : fillColor}
      />
      {stick.max > rectMax && (
        <path
          d={`M${Math.floor(x0 + candleWidth / 2) + 0.5},${rectY} l0,${maxY - rectY} m${-(
            candleWidth / 2
          )},0 l${candleWidth},0`}
          strokeWidth={1}
          stroke={colors.dark.mediumDark}
        />
      )}
      {stick.min < rectMin && (
        <path
          d={`M${Math.floor(x0 + candleWidth / 2) + 0.5},${rectY + rectHeight} l0,${
            minY - rectY - rectHeight
          } m${-(candleWidth / 2)},0 l${candleWidth},0`}
          strokeWidth={1}
          stroke={colors.dark.mediumDark}
        />
      )}
      {highlight && (
        <g>
          <rect
            fill={colors.translucent.light.light}
            height={40}
            stroke={colors.translucent.dark.dark}
            strokeWidth={2}
            width={labelWidth}
            x={labelX - labelWidth / 2}
            y={bottom - 40}
          />
          <text
            alignmentBaseline="hanging"
            color={colors.black}
            fontSize={12}
            textAnchor="middle"
            x={labelX}
            y={bottom - 32}
          >
            {formatCurrency(stick.start, { abbreviate: true })} &rarr;{' '}
            {formatCurrency(stick.end, { abbreviate: true })}
          </text>
          <text
            alignmentBaseline="hanging"
            color={colors.black}
            fontSize={12}
            textAnchor="middle"
            x={labelX}
            y={bottom - 16}
          >
            &darr; {formatCurrency(stick.min, { abbreviate: true })} &uarr;{' '}
            {formatCurrency(stick.max, { abbreviate: true })}
          </text>
        </g>
      )}
    </g>
  );
};

const GraphWithData: React.ComponentType<{
  candles: FundHistoryCandlestickGroup[];
  height: number;
  padding: Padding;
  width: number;
}> = ({ candles, height, padding, width }) => {
  const ranges = useMemo<Range>(() => {
    const minX = candles[0].t0;
    const maxX = candles[candles.length - 1].t1;
    const minY = candles.reduce<number>(
      (min, group) => Math.min(min, group.min - 100000),
      Infinity,
    );
    const maxY = candles.reduce<number>((max, group) => Math.max(max, group.max), -Infinity);

    return { minX, maxX, minY, maxY };
  }, [candles]);

  const dimensions = useMemo<Dimensions>(
    () => ({
      height,
      padding,
      width,
      ...ranges,
    }),
    [height, padding, ranges, width],
  );

  const calc = useMemo<Calc>(() => genPixelCompute(dimensions), [dimensions]);

  const labelY = useLabelY(FundMode.Candlestick);
  const tickSize = useMemo(
    () => getTickSize(ranges.minY, ranges.maxY, GRAPH_FUNDS_NUM_TICKS),
    [ranges.minY, ranges.maxY],
  );
  const BeforeLines = useMemo<React.ComponentType<DrawProps>>(() => {
    const CandlestickAxes: React.ComponentType<DrawProps> = (props: DrawProps): JSX.Element => (
      <TimeAxes {...props} hideMinorTicks yAlign="right" tickSizeY={tickSize} labelY={labelY} />
    );
    return CandlestickAxes;
  }, [tickSize, labelY]);

  if (ranges.minY >= ranges.maxY) {
    return null;
  }

  return (
    <Graph height={height} padding={padding} width={width}>
      <BeforeLines height={height} padding={padding} width={width} {...ranges} {...calc} />
      <g>
        {candles.map((stick) => (
          <Candlestick key={stick.id} calc={calc} ranges={ranges} stick={stick} />
        ))}
      </g>
    </Graph>
  );
};

export const GraphFundsAsCandlestick = memo<
  {
    historyOptions: HistoryOptions;
  } & Omit<ComponentProps<typeof GraphWithData>, 'candles'>
>(({ historyOptions, ...props }) => {
  const [{ data }] = useFundHistoryCandlestickQuery({
    variables: historyOptions,
  });

  const now = useNow();
  const { value } = useSelector(getFundsCachedValue.now(now));
  const [scrapedCandle, setScrapedCandle] = useState<
    Omit<FundHistoryCandlestickGroup, 't0' | 't1'>
  >({ id: -1, start: value, end: value, max: value, min: value });

  useEffect(() => {
    setScrapedCandle((prev) => ({
      ...prev,
      end: value,
      max: Math.max(prev.max, value),
      min: Math.min(prev.min, value),
    }));
  }, [value]);

  const candles = useMemo<FundHistoryCandlestickGroup[]>(() => {
    const originalCandles = data?.fundHistoryCandlestick?.candles ?? [];

    if (!originalCandles.length) {
      return [];
    }

    const nowTimestamp = getUnixTime(now);
    const nowIndex = originalCandles.findIndex(
      (candle) => candle.t0 <= nowTimestamp && candle.t1 >= nowTimestamp,
    );

    return nowIndex > -1
      ? replaceAtIndex(originalCandles, nowIndex, (prev) => ({
          ...prev,
          end: scrapedCandle.end,
          max: Math.max(prev.max, scrapedCandle.max),
          min: Math.min(prev.min, scrapedCandle.min),
        }))
      : [
          ...originalCandles,
          {
            t0: nowTimestamp - (originalCandles[0].t1 - originalCandles[0].t0),
            t1: nowTimestamp,
            ...scrapedCandle,
          },
        ];
  }, [data, now, scrapedCandle]);

  return candles.length ? <GraphWithData {...props} candles={candles} /> : null;
});
GraphFundsAsCandlestick.displayName = 'GraphFundsAsCandlestick';
