import React from 'react';

import { formatCurrency } from '~client/modules/format';
import * as Styled from './styles';
import { Aggregate, AggregateSums } from '~client/types/net-worth';

export type Props = {
  item: Aggregate;
  aggregate: AggregateSums;
};

const SumByCategory: React.FC<Props> = ({ item, aggregate }) => (
  <Styled.SumValue item={item}>{formatCurrency(aggregate[item], { precision: 0 })}</Styled.SumValue>
);

export default SumByCategory;
