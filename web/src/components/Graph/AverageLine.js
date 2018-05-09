import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { listAverage } from '../../helpers/data';
import { rgba } from '../../helpers/color';
import { COLOR_LIGHT_GREY } from '../../constants/colors';
import { getSingleLinePath } from './helpers';

export default function AverageLine({ value, data, ...props }) {
    if (!value) {
        return null;
    }

    const averageData = data.reduce(({ last, points }, point) => {
        const nextLast = last.slice(1 - value).push(point.get(1));
        const average = listAverage(nextLast);

        return { last: nextLast, points: points.push(point.set(1, average)) };

    }, { last: list.of(), points: list.of() })
        .points;

    const averageLinePath = getSingleLinePath({
        ...props, data: averageData, smooth: true, fill: false
    });

    return (
        <path d={averageLinePath}
            stroke={rgba(COLOR_LIGHT_GREY)}
            strokeDasharray="3,5"
            strokeWidth={1}
            fill="none"
        />
    );
}

AverageLine.propTypes = {
    value: PropTypes.number,
    data: PropTypes.instanceOf(list).isRequired
};

