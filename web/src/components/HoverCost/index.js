import './style.scss';
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency } from '../../helpers/format';

export default function HoverCost(allProps) {
    const [hover, setHover] = useState(null);

    const { abbreviate, value, ...props } = allProps;

    if (abbreviate === false) {
        return <span className="hover-cost">{value}</span>;
    }

    const formattedValue = formatCurrency(value, {
        brackets: true,
        ...props,
        abbreviate: false
    });
    const abbreviated = formatCurrency(value, {
        abbreviate: true,
        precision: 1,
        brackets: true,
        ...props
    });

    if (formattedValue === abbreviated) {
        return <span className="hover-cost">{formattedValue}</span>;
    }

    const onMouseEnter = useCallback(() => setHover(true));
    const onMouseLeave = useCallback(() => setHover(null));

    const className = classNames('hover-cost', { hover });

    return (
        <span className={className}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <span className="abbreviated">{abbreviated}</span>
            {hover && <span className="full">{formattedValue}</span>}
        </span>
    );
}

HoverCost.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.number.isRequired,
        PropTypes.string.isRequired
    ]),
    abbreviate: PropTypes.bool,
    precision: PropTypes.number
};
