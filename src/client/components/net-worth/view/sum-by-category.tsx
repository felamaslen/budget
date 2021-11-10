import * as Styled from './styles';
import { formatCurrency } from '~client/modules/format';
import type { NetWorthAggregateSums } from '~client/types';
import { NetWorthAggregate } from '~shared/constants';

export type Props = {
  item: NetWorthAggregate;
  aggregate?: Partial<NetWorthAggregateSums>;
};

const SumByCategory: React.FC<Props> = ({ item, aggregate }) => (
  <Styled.SumValue item={item} title={item}>
    {formatCurrency(aggregate?.[item] ?? 0, { precision: 0 })}
  </Styled.SumValue>
);

export default SumByCategory;
