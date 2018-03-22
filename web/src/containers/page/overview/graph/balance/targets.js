import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { FONT_GRAPH_KEY } from '../../../../../constants/graph';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_DARK } from '../../../../../constants/colors';
import { formatCurrency } from '../../../../../helpers/format';
import { rgba } from '../../../../../helpers/color';

export default function Targets({ targets }) {
    const [fontSize, fontFamily] = FONT_GRAPH_KEY;

    const tags = targets.map(target => `${formatCurrency(target.get('value'), {
        raw: true, noPence: true, abbreviate: true, precision: 0
    })} (${target.get('tag')})`)
        .map((target, key) => (
            <text key={key}
                x={50}
                y={72 + 22 * key}
                fill={rgba(COLOR_DARK)}
                alignmentBaseline="hanging"
                fontFamily={fontFamily}
                fontSize={fontSize}>
                {target}
            </text>
        ));

    return (
        <g>
            <rect x={48} y={70} width={100} height={targets.size * 22 + 4}
                fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />
            {tags}
        </g>
    );
}

Targets.propTypes = {
    targets: PropTypes.instanceOf(list).isRequired
};
