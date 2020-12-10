import React from 'react';

import * as Styled from './styles';

export const Spinner: React.FC<Partial<Styled.OuterProps>> = ({
  color,
  cover = false,
  size = 2,
}) => (
  <Styled.Outer cover={cover} size={size} color={color}>
    <Styled.Loader size={size} color={color} />
  </Styled.Outer>
);
