import React from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '~client/modules/format';
import * as Styled from './styles';

const SumByCategory = ({ item, aggregate }) => (
    <Styled.SumValue item={item}>
        {formatCurrency(aggregate[item], { precision: 0 })}
    </Styled.SumValue>
);

SumByCategory.propTypes = {
    item: PropTypes.string.isRequired,
    aggregate: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
};

export default SumByCategory;
