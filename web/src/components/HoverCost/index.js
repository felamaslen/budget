import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';

import * as Styled from './styles';

export default function HoverCost(allProps) {
    const { abbreviate, value, ...props } = allProps;
    const [hover, setHover] = useState(false);

    const formattedValue = formatCurrency(value, {
        brackets: true,
        ...props,
        abbreviate: false,
    });

    const abbreviated =
        abbreviate &&
        formatCurrency(value, {
            abbreviate: true,
            precision: 1,
            brackets: true,
            ...props,
        });

    const doHover = formattedValue !== abbreviated;

    if (!abbreviate) {
        return <Styled.HoverCost>{value}</Styled.HoverCost>;
    }

    if (!doHover) {
        return <Styled.HoverCost>{formattedValue}</Styled.HoverCost>;
    }

    return (
        <Styled.HoverCost
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(null)}
            hover={hover}
        >
            {hover && formattedValue}
            {!hover && abbreviated}
        </Styled.HoverCost>
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
