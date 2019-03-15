import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Arrow from '../Arrow';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_DARK } from '~client/constants/colors';
import { formatCurrency } from '~client/helpers/format';
import { rgba } from '~client/helpers/color';

const formatTarget = target => `${formatCurrency(target.get('value'), {
    raw: true, noPence: true, abbreviate: true, precision: 0
})} (${target.get('tag')})`;

export default function Targets({ showAll, targets, ...props }) {
    const [fontSize, fontFamily] = FONT_GRAPH_KEY;

    const tags = targets.map((target, key) => (
        <text key={key}
            x={50}
            y={72 + 22 * key}
            fill={rgba(COLOR_DARK)}
            alignmentBaseline="hanging"
            fontFamily={fontFamily}
            fontSize={fontSize}>
            {formatTarget(target)}
        </text>
    ));

    const monthWidth = props.pixX(2628000) - props.pixX(0);

    const arrowAngle = target =>
        Math.atan2(props.pixY(target.get('from')) - props.pixY(target.get('value')),
            monthWidth * (target.get('months') + target.get('last')));

    const arrows = targets.map((target, key) => (
        <Arrow key={key}
            startX={target.get('date')}
            startY={target.get('from')}
            length={100 * (1 + key) * 0.8 ** (showAll >> 0)}
            angle={arrowAngle(target)}
            color={rgba(COLOR_DARK)}
            strokeWidth={1}
            arrowSize={target.get('months') / 24}
            {...props}
        />
    ));

    return (
        <g className="savings-targets">
            <rect x={48} y={70} width={100} height={targets.size * 22 + 4}
                fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />
            {tags}
            {arrows}
        </g>
    );
}

Targets.propTypes = {
    showAll: PropTypes.bool,
    width: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    targets: PropTypes.instanceOf(list).isRequired
};
