import React, { useCallback } from 'react';

import * as Styled from './styles';

type Props = {
  showAll: boolean;
  setShowAll: (next: (last: boolean) => boolean) => void;
};

export const AfterCanvas: React.FC<Props> = ({ showAll, setShowAll }) => {
  const skip = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const onToggle = useCallback(
    (event) => {
      skip(event);
      setShowAll((last: boolean): boolean => !last);
    },
    [setShowAll, skip],
  );

  return (
    <Styled.ShowAll
      onClick={onToggle}
      onMouseMove={skip}
      onMouseOver={skip}
      onFocus={skip}
      onMouseOut={skip}
      onBlur={skip}
      onTouchStart={skip}
      onTouchMove={skip}
      onTouchEnd={skip}
    >
      <span>{'Show all'}</span>
      <Styled.CheckBox enabled={showAll} />
    </Styled.ShowAll>
  );
};
