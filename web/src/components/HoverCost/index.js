import './style.scss';
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency } from '~client/modules/format';

export default function HoverCost(allProps) {
    const [hover, setHover] = useState(null);

    const { abbreviate, value, ...props } = allProps;

    const formattedValue = formatCurrency(value, {
        brackets: true,
        ...props,
        abbreviate: false,
    });

    const abbreviated = abbreviate && formatCurrency(value, {
        abbreviate: true,
        precision: 1,
        brackets: true,
        ...props,
    });

    const doHover = formattedValue !== abbreviated;

    const onMouseEnter = useCallback(() => doHover && setHover(true), [doHover, setHover]);
    const onMouseLeave = useCallback(() => doHover && setHover(null), [doHover, setHover]);

    if (!abbreviate) {
        return (
            <span className="hover-cost">{value}</span>
        );
    }

    if (!doHover) {
        return (
            <span className="hover-cost">{formattedValue}</span>
        );
    }

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
        PropTypes.string.isRequired,
    ]),
    abbreviate: PropTypes.bool,
    precision: PropTypes.number,
};

HoverCost.defaultProps = {
    abbreviate: true,
};
