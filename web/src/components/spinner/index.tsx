import React from 'react';
import * as Spinners from 'react-spinners';

import * as Styled from './styles';

export const Spinner: React.FC<Partial<Styled.OuterProps>> = ({
  color,
  cover = false,
  size = 2,
}) => (
  <Styled.Outer cover={cover} size={size} color={color}>
    <Spinners.PuffLoader loading={true} size={size * 50} />
  </Styled.Outer>
);
