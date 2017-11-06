import { List as list } from 'immutable'
import React from 'react'
import PropTypes from 'prop-types'

export default function Timeline({ data }) {
    const dataPositive = data.map(item => Math.max(item, 0))

    const range = dataPositive.max()

    const rB = 0.05;
    const rA = (Math.pow(Math.E, 1 / rB) - 1) / range;
    const fV = value => rB * Math.log(rA * value + 1);

    const items = dataPositive
        .map((value, timeKey) => {
            const colorValue = Math.round(255 * (1 - fV(value)))
            const style = { backgroundColor: `rgb(${colorValue}, ${colorValue}, ${colorValue})` }

            return <span key={timeKey} className="data-item" style={style} />
        })

    return <div className="timeline-outer">
        {items}
    </div>
}

Timeline.propTypes = {
    data: PropTypes.instanceOf(list)
}

