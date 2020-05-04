import React from 'react';
import { formatCurrency } from '~client/modules/format';

import * as Styled from './styles';

type Props = {
  value: number | string;
};

const HoverCost: React.FC<Props> = ({ value }) => {
  const [hover, setHover] = React.useState<boolean>(false);

  if (typeof value === 'string') {
    return <span>{value}</span>;
  }

  return (
    <Styled.HoverCost
      onMouseEnter={(): void => setHover(true)}
      onMouseLeave={(): void => setHover(false)}
      hover={hover}
    >
      {hover &&
        formatCurrency(value, {
          brackets: true,
          abbreviate: false,
        })}
      {!hover &&
        formatCurrency(value, {
          abbreviate: true,
          precision: 1,
          brackets: true,
        })}
    </Styled.HoverCost>
  );
};

export default HoverCost;
