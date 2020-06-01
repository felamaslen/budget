import React, { useCallback } from 'react';

import * as Styled from './styles';
import { formatCurrency } from '~client/modules/format';

type Props = {
  value: number | string;
};

const HoverCost: React.FC<Props> = ({ value }) => {
  const [hover, setHover] = React.useState<boolean>(false);
  const onActivate = useCallback(() => setHover(true), []);
  const onDeactivate = useCallback(() => setHover(false), []);

  if (typeof value === 'string') {
    return <span>{value}</span>;
  }

  return (
    <Styled.HoverCost
      tabIndex={0}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      hover={hover}
    >
      <Styled.Main>
        {formatCurrency(value, {
          abbreviate: true,
          precision: 1,
          brackets: true,
        })}
      </Styled.Main>
      <Styled.Hover>
        {formatCurrency(value, {
          brackets: true,
          abbreviate: false,
        })}
      </Styled.Hover>
    </Styled.HoverCost>
  );
};

export default HoverCost;
