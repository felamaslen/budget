import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { FONT_GRAPH_TITLE } from '../../constants/graph';
import { COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_DARK } from '../../constants/colors';
import { rgba } from '../../helpers/color';

export default function HighlightPoint({ pixX, pixY, width, height, hoverEffect, ...props }) {
    const { hlPoint } = hoverEffect;
    if (!hlPoint) {
        return null;
    }

    const [fontSize, fontFamily] = FONT_GRAPH_TITLE;

    const posX = Math.floor(pixX(hlPoint.get(0))) + 0.5;
    const posY = Math.floor(pixY(hlPoint.get(1))) + 0.5;

    const labelWidthX = 88;
    const labelWidthY = 50;
    const labelHeight = fontSize + 2;

    let anchorLabelX = 'middle';
    let labelPosX = posX;
    if (posX >= width - labelWidthX / 2) {
        anchorLabelX = 'end';
        labelPosX = width;
    }
    else if (posX < labelWidthX / 2) {
        anchorLabelX = 'start';
        labelPosX = 0;
    }

    const labelTextX = hoverEffect.labelX(hlPoint.get(0), props);
    const labelTextY = hoverEffect.labelY(hlPoint.get(1), props);

    const pathVertical = `M${posX},0 L${posX},${height}`;
    const pathHorizontal = `M0,${posY} L${width},${posY}`;

    const lineColor = hlPoint.get(2);
    const lineProps = { stroke: lineColor, strokeDasharray: '3,2' };

    const textProps = { fontSize, fontFamily, color: rgba(COLOR_GRAPH_TITLE) };
    const textPropsX = {
        'x': labelPosX,
        'y': height - 2,
        textAnchor: anchorLabelX,
        alignmentBaseline: 'baseline'
    };
    const textPropsY = {
        'x': width,
        'y': posY,
        textAnchor: 'end',
        alignmentBaseline: 'middle'
    };

    return <g className="hl-point">
        <path d={pathVertical} {...lineProps} />
        <path d={pathHorizontal} {...lineProps} />
        <rect x={posX - labelWidthX / 2} y={height - labelHeight} width={labelWidthX} height={labelHeight}
            fill={rgba(COLOR_TRANSLUCENT_DARK)} />
        <text {...textProps} {...textPropsX}>{labelTextX}</text>
        <rect x={width - labelWidthY} y={posY - labelHeight / 2} width={labelWidthY} height={labelHeight}
            fill={rgba(COLOR_TRANSLUCENT_DARK)} />
        <text {...textProps} {...textPropsY}>{labelTextY}</text>
    </g>;
}

HighlightPoint.propTypes = {
    hoverEffect: PropTypes.shape({
        labelX: PropTypes.func.isRequired,
        labelY: PropTypes.func.isRequired,
        hlPoint: PropTypes.instanceOf(list)
    }).isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};


