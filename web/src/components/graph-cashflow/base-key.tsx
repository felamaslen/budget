import React from 'react';
import { rgba } from '~client/modules/color';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_GRAPH_TITLE } from '~client/constants/colors';
import { FONT_GRAPH_TITLE } from '~client/constants/graph';

export type Props = {
    title: string;
    children?: React.ReactNode;
};

const [fontSize, fontFamily] = FONT_GRAPH_TITLE;

export const BaseKey: React.FC<Props> = ({ title, children }) => (
    <g>
        <rect x={45} y={8} width={200} height={60} fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />

        <text
            x={65}
            y={10}
            color={rgba(COLOR_GRAPH_TITLE)}
            alignmentBaseline="hanging"
            fontSize={fontSize}
            fontFamily={fontFamily}
        >
            {title}
        </text>
        {children}
    </g>
);
