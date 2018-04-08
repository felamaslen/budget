import React from 'react';
import PropTypes from 'prop-types';
import { rgba } from '../../helpers/color';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_GRAPH_TITLE } from '../../constants/colors';
import { FONT_GRAPH_TITLE } from '../../constants/graph';

export default function BaseKey({ title, children }) {
    const [fontSize, fontFamily] = FONT_GRAPH_TITLE;

    return <g className="key">
        <rect x={45} y={8} width={200} height={60}
            fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />

        <text x={65} y={10} color={rgba(COLOR_GRAPH_TITLE)} alignmentBaseline="hanging"
            fontSize={fontSize} fontFamily={fontFamily}>{title}</text>
        {children}
    </g>;
}

BaseKey.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ])
};


