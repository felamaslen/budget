import React from 'react';
import { Arrow } from '~client/components/arrow';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_DARK } from '~client/constants/colors';
import { formatCurrency } from '~client/modules/format';
import { rgba } from '~client/modules/color';
import { RangeY, PixPrimary } from '~client/types/graph';
import { Target } from '~client/types/overview';

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

type Props = {
    showAll: boolean;
    targets: Target[];
} & RangeY &
    PixPrimary;

export const Targets: React.FC<Props> = ({ showAll, targets, minY, maxY, pixX, pixY1 }) => {
    const tags = targets.map(({ tag, value }, index) => (
        <text
            key={tag}
            x={50}
            y={72 + 22 * index}
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
    ));

    const monthWidth = pixX(2628000) - pixX(0);

    const arrows =
        minY !== maxY &&
        targets.map(({ tag, date, value, from, months, last }, index) => (
            <Arrow
                key={tag}
                startX={date}
                startY={from}
                length={100 * (1 + index) * 0.8 ** (showAll ? 1 : 0)}
                angle={Math.atan2(pixY1(from) - pixY1(value), monthWidth * (months + last))}
                color={rgba(COLOR_DARK)}
                strokeWidth={1}
                arrowSize={months / 24}
                pixX={pixX}
                pixY={pixY1}
            />
        ));

    return (
        <g>
            <rect
                x={48}
                y={70}
                width={100}
                height={targets.length * 22 + 4}
                fill={rgba(COLOR_TRANSLUCENT_LIGHT)}
            />
            {tags}
            {arrows}
        </g>
    );
};