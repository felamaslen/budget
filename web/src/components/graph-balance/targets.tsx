import React from 'react';
import { Arrow } from '~client/components/arrow';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_DARK } from '~client/constants/colors';
import { formatCurrency } from '~client/modules/format';
import { rgba } from '~client/modules/color';
import { RangeY, PixPrimary, Size } from '~client/types/graph';
import { Target } from '~client/types/overview';

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

type Props = {
  showAll: boolean;
  targets: Target[];
} & RangeY &
  Pick<Size, 'width'> &
  PixPrimary;

const monthSeconds = 2628000;

const yOffset = 92;
const arrowColor = rgba(COLOR_DARK);
const keyBg = rgba(COLOR_TRANSLUCENT_LIGHT);

export const Targets: React.FC<Props> = ({ showAll, targets, minY, maxY, pixX, pixY1, width }) => (
  <g>
    <rect x={48} y={yOffset - 4} width={64} height={targets.length * 22 - 4} fill={keyBg} />
    {targets.map(({ tag, value }, index) => (
      <text
        key={tag}
        x={50}
        y={yOffset + 22 * index}
        fill={rgba(COLOR_DARK)}
        alignmentBaseline="hanging"
        fontFamily={fontFamily}
        fontSize={fontSize}
      >
        {`${formatCurrency(value, {
          raw: true,
          noPence: true,
          abbreviate: true,
          precision: 0,
        })} (${tag})`}
      </text>
    ))}
    {minY !== maxY &&
      targets.map(
        ({ tag, date: startX, value, from: startY, months, last }: Target, index: number) => {
          const angle = Math.atan2(
            pixY1(startY) - pixY1(value),
            (pixX(monthSeconds) - pixX(0)) * (months + last),
          );

          return (
            <Arrow
              key={tag}
              startX={startX}
              startY={startY}
              length={Math.min(
                100 * (1 + index) * 0.8 ** (showAll ? 1 : 0),
                (width - pixX(startX)) / Math.cos(angle),
              )}
              angle={angle}
              color={arrowColor}
              strokeWidth={1}
              arrowSize={months / 24}
              pixX={pixX}
              pixY={pixY1}
            />
          );
        },
      )}
  </g>
);
