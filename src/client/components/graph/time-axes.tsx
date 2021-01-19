import React from 'react';

import { getTimeScale } from '~client/components/graph/helpers';
import { FONT_AXIS_LABEL } from '~client/constants/graph';
import { getTickSize, formatCurrency } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import type { DrawProps, Tick } from '~client/types';

const [fontSize, fontFamily] = FONT_AXIS_LABEL;

export type LabelY = (value: number) => string;

type Props = {
  dualAxis?: boolean;
  offset?: number;
  tickSizeY?: number;
  hideMinorTicks?: boolean;
  yAlign?: 'left' | 'right';
  labelY?: LabelY;
  labelY2?: LabelY;
} & DrawProps;
export { Props as TimeAxesProps };

type TicksY = {
  pos: number;
  major: boolean;
  value: number;
  valueSecondary?: number;
}[];

function getTicksY({ minY, maxY, pixY1, valY2, tickSizeY = 0, hideMinorTicks }: Props): TicksY {
  const tickSize = tickSizeY || getTickSize(minY, maxY);
  const majorPeriod = hideMinorTicks ? 1 : 5;
  const minorTickSize = tickSize / majorPeriod;
  const tickStart = Math.floor(minY / minorTickSize) * minorTickSize;

  const numTicks = Math.ceil((maxY - minY) / minorTickSize);
  if (numTicks < 0 || numTicks > 50 || Number.isNaN(numTicks)) {
    return [];
  }

  return Array(numTicks + 1)
    .fill(0)
    .reduce<TicksY>((last, _, index) => {
      const value = tickStart + index * minorTickSize;
      const pos = Math.floor(pixY1(value)) + 0.5;

      if (last.some((tick) => tick.pos === pos)) {
        // this usually happens on asynchronous data recalculation or when the data constraints
        // are in an extreme configuration
        return last;
      }

      const valueSecondary = valY2(pixY1(value));
      const major = index % majorPeriod === 0;

      return [...last, { pos, major, value, valueSecondary }];
    }, []);
}

const defaultLabelY = (value: number): string =>
  formatCurrency(value, {
    raw: true,
    noPence: true,
    abbreviate: true,
    precision: 1,
  });

const timeTickLength = 10;
const timeTickSize = (major: 0 | 1 | 2): number => timeTickLength * 0.5 * (major + 1);

const timeLineColors: string[] = [colors.light.mediumLight, colors.light.dark];
const timeLineColor = (major: 0 | 1 | 2): string => timeLineColors[major > 1 ? 1 : 0];

const timeTickColors: string[] = [colors.black, colors.dark.light];
const timeTickColor = (major: 0 | 1 | 2): string => timeTickColors[major > 0 ? 1 : 0];

const transformText = (xPix: number, yPix: number): string => `rotate(-30 ${xPix} ${yPix})`;

type YAxisPartProps = {
  ticksY: TicksY;
};

type YAxisTicksProps = YAxisPartProps & {
  x0: number;
  xMax: number;
};

const TicksYMajor: React.FC<YAxisTicksProps> = ({ x0, xMax, ticksY }) => (
  <g>
    {ticksY
      .filter(({ major }) => major)
      .map(({ pos }) => (
        <line
          key={pos}
          x1={x0}
          y1={pos}
          x2={xMax}
          y2={pos}
          stroke={colors.light.dark}
          strokeWidth={1}
        />
      ))}
  </g>
);

const TicksYMinor: React.FC<YAxisTicksProps> = ({ x0, xMax, ticksY }) => (
  <g>
    {ticksY
      .filter(({ major }) => !major)
      .map(({ pos }) => (
        <line
          key={pos}
          x1={x0}
          y1={pos}
          x2={xMax}
          y2={pos}
          stroke={colors.light.mediumLight}
          strokeWidth={1}
        />
      ))}
  </g>
);

type YAxisTextProps = YAxisPartProps & {
  secondary?: boolean;
  align: 'left' | 'right';
  alignPos: number;
  labelY: LabelY;
};

const TicksYText: React.FC<YAxisTextProps> = ({ secondary, ticksY, labelY, align, alignPos }) => (
  <g>
    {ticksY
      .filter(({ major }) => major)
      .map(({ value, valueSecondary = value, pos }) => (
        <text
          key={pos}
          x={alignPos}
          textAnchor={align === 'left' ? 'start' : 'end'}
          y={pos - 2}
          fontFamily={fontFamily}
          fontSize={fontSize}
          alignmentBaseline="baseline"
        >
          {labelY(secondary ? valueSecondary : value)}
        </text>
      ))}
  </g>
);

const YAxis: React.FC<Props> = (props) => {
  const ticksY = getTicksY(props);

  const {
    dualAxis,
    minX,
    maxX,
    pixX,
    yAlign,
    hideMinorTicks,
    labelY2 = defaultLabelY,
    labelY = defaultLabelY,
  } = props;

  const x0 = pixX(minX);
  const xMax = pixX(maxX);

  const [alignPosPrimary, alignPosSecondary] = yAlign === 'right' ? [xMax, x0] : [x0, xMax];

  return (
    <>
      <TicksYMajor x0={x0} xMax={xMax} ticksY={ticksY} />
      {!hideMinorTicks && <TicksYMinor x0={x0} xMax={xMax} ticksY={ticksY} />}
      <TicksYText
        ticksY={ticksY}
        labelY={labelY}
        align={yAlign ?? 'left'}
        alignPos={alignPosPrimary}
      />
      {dualAxis && (
        <TicksYText
          secondary
          ticksY={ticksY}
          labelY={labelY2}
          align={yAlign === 'right' ? 'left' : 'right'}
          alignPos={alignPosSecondary}
        />
      )}
    </>
  );
};

type TicksXProps = {
  timeScale: Tick[];
  y0: number;
};

type TicksXBackgroundProps = TicksXProps & {
  hideMinorTicks: boolean;
};

const TicksXBackground: React.FC<TicksXBackgroundProps> = ({ timeScale, y0, hideMinorTicks }) => (
  <g>
    {timeScale
      .filter(({ major }) => major || !hideMinorTicks)
      .map(({ pix, major }) => (
        <line
          key={pix}
          x1={pix}
          y1={y0 - timeTickSize(major)}
          x2={pix}
          y2={0}
          stroke={timeLineColor(major)}
          strokeWidth={0.5}
        />
      ))}
  </g>
);

type TicksXForegroundProps = TicksXProps;

const TicksXForeground: React.FC<TicksXForegroundProps> = ({ timeScale, y0 }) => (
  <g>
    {timeScale.map(({ pix, major }) => (
      <line
        key={`${pix}-${major}`}
        x1={pix}
        y1={y0}
        x2={pix}
        y2={y0 - timeTickSize(major)}
        stroke={timeTickColor(major)}
        strokeWidth={1}
      />
    ))}
  </g>
);

type TicksXTextProps = TicksXProps;

const TicksXText: React.FC<TicksXTextProps> = ({ timeScale, y0 }) => (
  <g>
    {timeScale
      .filter(({ text }) => text)
      .map(({ text, pix, major }) => (
        <text
          key={pix}
          x={pix}
          y={y0 - timeTickSize(major)}
          fontFamily={fontFamily}
          fontSize={fontSize}
          alignmentBaseline="baseline"
          transform={transformText(pix, y0 - timeTickSize(major))}
        >
          {text}
        </text>
      ))}
  </g>
);

export const TimeAxes: React.FC<Props> = (props) => {
  const {
    minX,
    minY,
    minY2 = minY,
    maxX,
    maxY,
    maxY2 = maxY,
    pixX,
    pixY1,
    offset = 0,
    hideMinorTicks = false,
  } = props;

  const y0 = pixY1(minY);

  if (Number.isNaN(y0) || y0 === Infinity || y0 === -Infinity || minY === maxY || minY2 === maxY2) {
    return null;
  }

  const timeScale: Tick[] = getTimeScale({ minX, maxX, pixX })(offset);

  return (
    <g>
      <YAxis {...props} />
      <TicksXBackground y0={y0} timeScale={timeScale} hideMinorTicks={hideMinorTicks} />
      <TicksXForeground y0={y0} timeScale={timeScale} />
      <TicksXText y0={y0} timeScale={timeScale} />
    </g>
  );
};
