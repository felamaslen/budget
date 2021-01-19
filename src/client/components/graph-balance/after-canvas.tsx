import React, { useCallback } from 'react';

import * as Styled from './styles';

type Props = {
  isLoading?: boolean;
  showAll: boolean;
  setShowAll: (next: (last: boolean) => boolean) => void;
};

export const AfterCanvas: React.FC<Props> = ({ isLoading, showAll, setShowAll }) => {
  const skip = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const onToggle = useCallback(
    (event) => {
      if (isLoading) {
        return;
      }
      skip(event);
      setShowAll((last: boolean): boolean => !last);
    },
    [isLoading, setShowAll, skip],
  );

  return (
    <Styled.ShowAll
      isLoading={isLoading}
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
      <Styled.CheckBox enabled={showAll} />
      <span>Show all</span>
    </Styled.ShowAll>
  );
};
