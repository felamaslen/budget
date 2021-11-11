import { useCallback } from 'react';

import * as Styled from './styles';
import { useCTA } from '~client/hooks';

type Props = {
  digit: number;
  onInput: (digit: number) => void;
};

export const Digit: React.FC<Props> = ({ digit, onInput }) => {
  const onActivate = useCallback(() => onInput(digit), [digit, onInput]);
  const { onClick, onKeyDown } = useCTA(onActivate);

  return (
    <Styled.Digit tabIndex={-1} digit={digit} onMouseDown={onClick} onKeyDown={onKeyDown}>
      {digit}
    </Styled.Digit>
  );
};
