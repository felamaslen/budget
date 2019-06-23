import React, { useMemo } from 'react';
import { COLOR_CATEGORY } from '~client/constants/colors';
import { rgba, averageColor } from '~client/modules/color';
import { timelineShape } from '~client/containers/PageAnalysis/prop-types';

const categories = ['bills', 'food', 'general', 'holiday', 'social'];

const rB = 0.1;

export default function Timeline({ data }) {
    const sums = useMemo(() => data.map(row => row.reduce((sum, value) => sum + value, 0)), [data]);
    const getSumScore = useMemo(() => {
        const range = sums.reduce((max, sum) => Math.max(max, sum), -Infinity);
        const rA = (Math.pow(Math.E, 1 / rB) - 1) / range;

        return value => rB * Math.log(rA * value + 1);
    }, [sums]);

    return (
        <div className="timeline-outer">
            {data.map((row, timeIndex) => {
                const score = getSumScore(sums[timeIndex]);
                const categoryScores = row.map(value => score * value / sums[timeIndex]);

                const colors = categoryScores.map((value, categoryKey) => ([
                    255 - (255 - COLOR_CATEGORY[categories[categoryKey]][0]) * value,
                    255 - (255 - COLOR_CATEGORY[categories[categoryKey]][1]) * value,
                    255 - (255 - COLOR_CATEGORY[categories[categoryKey]][2]) * value
                ]));

                const backgroundColor = rgba(averageColor(colors));
                const style = { backgroundColor };

                return <span key={timeIndex} className="data-item" style={style} />;
            })}
        </div>
    );
}

Timeline.propTypes = {
    data: timelineShape
};
