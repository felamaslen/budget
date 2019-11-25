import React, { memo, useMemo } from 'react';
import { COLOR_CATEGORY } from '~client/constants/colors';
import { rgba, averageColor } from '~client/modules/color';
import { timelineShape } from '~client/prop-types/page/analysis';

import * as Styled from './styles';

const categories = ['bills', 'food', 'general', 'holiday', 'social'];

const rB = 0.1;

function Timeline({ data }) {
    const sums = useMemo(() => data.map((row) => row.reduce((sum, value) => sum + value, 0)), [data]);
    const getSumScore = useMemo(() => {
        const range = sums.reduce((max, sum) => Math.max(max, sum), -Infinity);
        const rA = (Math.E ** (1 / rB) - 1) / range;

        return (value) => rB * Math.log(rA * value + 1);
    }, [sums]);

    return (
        <Styled.Timeline>
            {data.map((row, timeIndex) => {
                const score = getSumScore(sums[timeIndex]);
                const backgroundColor = averageColor(row
                    .map((value) => score * (value / sums[timeIndex]))
                    .map((value, categoryKey) => ([
                        255 - (255 - COLOR_CATEGORY[categories[categoryKey]][0]) * value,
                        255 - (255 - COLOR_CATEGORY[categories[categoryKey]][1]) * value,
                        255 - (255 - COLOR_CATEGORY[categories[categoryKey]][2]) * value,
                    ])));

                return (
                    <Styled.DataItem
                        key={timeIndex}
                        color={rgba(backgroundColor)}
                    />
                );
            })}
        </Styled.Timeline>
    );
}

Timeline.propTypes = {
    data: timelineShape,
};

export default memo(Timeline);
