import React from 'react';
import { colors } from '~client/styled/variables';

export const SankeyIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" height={16} width={16}>
    <path fill={colors.blue} d={`M0,100 C 50,100 60,72 100,72 L100,48 C 60,48 50,84 0,84`} />
    <path fill={colors.amber} d={`M0,82 C 50,82 60,36 100,36 L100,0 C 60,0 50,72 0,72`} />
  </svg>
);
