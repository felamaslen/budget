import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { arrayAverage } from '~client/modules/data';
import { rgba } from '~client/modules/color';
import { COLOR_LIGHT_GREY } from '~client/constants/colors';
import { getSingleLinePath } from '~client/components/Graph/helpers';
import { dataShape } from '~client/prop-types/graph';

export default function AverageLine({ value, data, ...props }) {
    const averageLinePath = useMemo(() => {
        if (!value) {
            return null;
        }

        const [points] = data.reduce(([lastPoints, compareData], [xValue, yValue]) => {
            const nextCompareData = compareData.slice(1 - value).concat([yValue]);

            return [
                lastPoints.concat([[xValue, arrayAverage(nextCompareData)]]),
                nextCompareData,
            ];
        }, [[], []]);

        if (!points.length) {
            return null;
        }

        return getSingleLinePath({
            ...props,
            data: points,
            smooth: true,
            fill: false,
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
    data: dataShape.isRequired,
};
