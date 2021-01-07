import React from 'react';

import * as Styled from './styles';
import { formatCurrency } from '~client/modules/format';
import { Aggregate, AggregateSums } from '~client/types/net-worth';

export type Props = {
  item: Aggregate;
  aggregate?: Partial<AggregateSums>;
};

const SumByCategory: React.FC<Props> = ({ item, aggregate }) => (
  <Styled.SumValue item={item} title={item}>
    {formatCurrency(aggregate?.[item] ?? 0, { precision: 0 })}
  </Styled.SumValue>
);

export default SumByCategory;
