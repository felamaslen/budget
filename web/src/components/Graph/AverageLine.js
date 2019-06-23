import { List as list } from 'immutable';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { listAverage } from '~client/modules/data';
import { rgba } from '~client/modules/color';
import { COLOR_LIGHT_GREY } from '~client/constants/colors';
import { getSingleLinePath } from './helpers';

export default function AverageLine({ value, data, ...props }) {
    const averageData = useMemo(() => {
        if (!value) {
            return null;
        }

        return data.reduce(({ last, points }, point) => {
            const nextLast = last.slice(1 - value).push(point.get(1));
            const average = listAverage(nextLast);

            return { last: nextLast, points: points.push(point.set(1, average)) };

        }, { last: list.of(), points: list.of() })
            .points;
    }, [value, data]);

    const averageLinePath = useMemo(() => {
        if (!averageData) {
            return null;
        }

        return getSingleLinePath({
            ...props, data: averageData, smooth: true, fill: false
        });
    }, [averageData, props]);

    if (!averageLinePath) {
        return null;
    }

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
