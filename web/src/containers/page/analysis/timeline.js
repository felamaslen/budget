import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';

import { COLOR_CATEGORY } from '../../../misc/config';
import { rgba, averageColor } from '../../../misc/color';

const categories = ['bills', 'food', 'general', 'holiday', 'social'];

export default function Timeline({ data }) {
    const sums = data.map(row => row.reduce((sum, value) => sum + value, 0));
    const range = sums.reduce((max, sum) => Math.max(max, sum), -Infinity);

    const rB = 0.1;
    const rA = (Math.pow(Math.E, 1 / rB) - 1) / range;
    const fV = value => rB * Math.log(rA * value + 1);

    const items = data
        .map((row, timeKey) => {
            const sum = sums.get(timeKey);
            const score = fV(sum);

            const categoryScores = row.map(value => score * value / sum);

            const colors = categoryScores.map((value, categoryKey) => [
                255 - (255 - COLOR_CATEGORY[categories[categoryKey]][0]) * value,
                255 - (255 - COLOR_CATEGORY[categories[categoryKey]][1]) * value,
                255 - (255 - COLOR_CATEGORY[categories[categoryKey]][2]) * value
            ]);

            const backgroundColor = rgba(averageColor(colors));
            const style = { backgroundColor };

            return <span key={timeKey} className="data-item" style={style} />;
        });

    return <div className="timeline-outer">
        {items}
    </div>;
}

Timeline.propTypes = {
    data: PropTypes.instanceOf(list)
};

