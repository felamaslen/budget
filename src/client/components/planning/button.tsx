import React from 'react';

import * as Styled from './styles';

import { useCTA } from '~client/hooks';

type ToggleButtonProps = {
  active: boolean;
  onToggle: () => void;
};

export const ToggleButton: React.FC<ToggleButtonProps> = ({ active, onToggle }) => {
  const onToggleEvents = useCTA(onToggle);
  return <Styled.Button {...onToggleEvents}>{active ? <>&larr;</> : <>&rarr;</>}</Styled.Button>;
};
