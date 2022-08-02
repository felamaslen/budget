import { ComponentProps, useMemo } from 'react';

import { genPixelCompute } from '../graph/helpers';
import { Graph } from '../graph/shared';
import { TimeAxes } from '../graph/time-axes';
import { useLabelY } from './utils';

import { GRAPH_FUNDS_NUM_TICKS } from '~client/constants';
import { getTickSize } from '~client/modules/format';
import { colors } from '~client/styled';
import type { Calc, Dimensions, DrawProps, HistoryOptions, Padding, Range } from '~client/types';
import {
  FundHistoryCandlestickGroup,
  FundMode,
  useFundHistoryCandlestickQuery,
} from '~client/types/gql';

const Candlestick: React.ComponentType<{
  calc: Calc;
  stick: FundHistoryCandlestickGroup;
}> = ({ calc, stick }) => {
  const x0 = calc.pixX(stick.t0) + 1;
  const candleWidth = calc.pixX(stick.t1) - x0 - 2;

  const rectMax = Math.max(stick.start, stick.end);
  const rectMin = Math.min(stick.start, stick.end);

  const rectY = calc.pixY1(rectMax);
  const rectHeight = Math.max(1, calc.pixY1(rectMin) - rectY);

  const maxY = calc.pixY1(stick.max);
  const minY = calc.pixY1(stick.min);

  return (
    <g>
      <rect
        x={x0}
        y={rectY}
        height={rectHeight}
        width={candleWidth}
        fill={stick.end >= stick.start ? colors.income.main : colors.loss.dark}
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
          <Candlestick key={stick.id} calc={calc} stick={stick} />
        ))}
      </g>
    </Graph>
  );
};

export const GraphFundsAsCandlestick: React.ComponentType<
  {
    historyOptions: HistoryOptions;
  } & Omit<ComponentProps<typeof GraphWithData>, 'candles'>
> = ({ historyOptions, ...props }) => {
  const [{ data }] = useFundHistoryCandlestickQuery({
    variables: historyOptions,
  });

  const candles = data?.fundHistoryCandlestick?.candles;
  return candles?.length ? <GraphWithData {...props} candles={candles} /> : null;
};
