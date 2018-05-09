import React from 'react';
import PropTypes from 'prop-types';
import { FONT_GRAPH_TITLE } from '../../constants/graph';
import { COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_DARK } from '../../constants/colors';
import { rgba } from '../../helpers/color';

function getLabelPosX(posX, width, labelWidthX) {
    let anchorLabelX = 'middle';
    let labelPosX = posX;
    let rectPosX = posX - labelWidthX / 2;

    if (posX >= width - labelWidthX / 2) {
        anchorLabelX = 'end';
        labelPosX = width;
        rectPosX = width - labelWidthX;
    }
    else if (posX < labelWidthX / 2) {
        anchorLabelX = 'start';
        labelPosX = 0;
        rectPosX = 0;
    }

    return { anchorLabelX, labelPosX, rectPosX };
}

function getLabelPosY(posY, height, labelHeight) {
    let labelPosY = posY;
    let rectPosY = labelPosY - labelHeight / 2;

    if (posY >= height - labelHeight / 2) {
        labelPosY = height - labelHeight / 2 + 2;
        rectPosY = height - labelHeight;
    }
    else if (posY < labelHeight / 2) {
        labelPosY = labelHeight / 2;
        rectPosY = 0;
    }

    return { labelPosY, rectPosY };
}

export default function HighlightPoint({ pixX, pixY, width, height, hoverEffect, hlPoint, ...props }) {
    if (!hlPoint) {
        return null;
    }

    const labelWidthX = hoverEffect.labelWidthX || 88;
    const labelWidthY = hoverEffect.labelWidthY || 50;

    const [fontSize, fontFamily] = FONT_GRAPH_TITLE;
    const labelHeight = fontSize + 2;

    const { valX, valY, color } = hlPoint;

    const posX = Math.floor(pixX(valX)) + 0.5;
    const posY = Math.floor(pixY(valY)) + 0.5;

    const { anchorLabelX, labelPosX, rectPosX } = getLabelPosX(posX, width, labelWidthX);
    const { labelPosY, rectPosY } = getLabelPosY(posY, height, labelHeight);

    const labelTextX = hoverEffect.labelX(valX, props);
    const labelTextY = hoverEffect.labelY(valY, props);

    const pathVertical = `M${posX},0 L${posX},${height}`;
    const pathHorizontal = `M0,${posY} L${width},${posY}`;

    const lineProps = { stroke: color, strokeDasharray: '3,2' };

    const textProps = { fontSize, fontFamily, color: rgba(COLOR_GRAPH_TITLE) };
    const textPropsX = {
        'x': labelPosX,
        'y': height - 2,
        textAnchor: anchorLabelX,
        alignmentBaseline: 'baseline'
    };
    const textPropsY = {
        'x': width,
        'y': labelPosY,
        textAnchor: 'end',
        alignmentBaseline: 'middle'
    };

    return <g className="hl-point">
        <path d={pathVertical} {...lineProps} />
        <path d={pathHorizontal} {...lineProps} />
        <rect x={rectPosX} y={height - labelHeight} width={labelWidthX} height={labelHeight}
            fill={rgba(COLOR_TRANSLUCENT_DARK)} />
        <text {...textProps} {...textPropsX}>{labelTextX}</text>
        <rect x={width - labelWidthY} y={rectPosY} width={labelWidthY} height={labelHeight}
            fill={rgba(COLOR_TRANSLUCENT_DARK)} />
        <text {...textProps} {...textPropsY}>{labelTextY}</text>
    </g>;
}

HighlightPoint.propTypes = {
    hoverEffect: PropTypes.shape({
        labelX: PropTypes.func.isRequired,
        labelY: PropTypes.func.isRequired
    }).isRequired,
    hlPoint: PropTypes.shape({
        valX: PropTypes.number.isRequired,
        valY: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired
    }),
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};


