import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { arrayAverage } from '~client/modules/data';
import { rgba } from '~client/modules/color';
import { COLOR_LIGHT_GREY } from '~client/constants/colors';
import { getSingleLinePath } from '~client/components/Graph/helpers';
import { lineShape } from '~client/components/Graph/prop-types';

export default function AverageLine({ value, data, ...props }) {
    const averageLinePath = useMemo(() => {
        if (!value) {
            return null;
        }

        const averageData = data.reduce(({ last, points }, [xValue, yValue]) => {
            const nextLast = last.slice(1 - value).concat([yValue]);
            const average = arrayAverage(nextLast);

            return { last: nextLast, points: points.concat([[xValue, average]]) };
        }, { last: [], points: [] })
            .points;

        return getSingleLinePath({
            ...props, data: averageData, smooth: true, fill: false
        });
    }, [props, value, data]);

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
    data: PropTypes.arrayOf(lineShape)
};
