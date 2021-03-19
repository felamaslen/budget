import React, { useCallback } from 'react';

import * as Styled from './styles';

export const ToggleContainer: React.FC<
  Styled.PropsToggleContainer & {
    value: boolean;
    setValue: React.Dispatch<React.SetStateAction<boolean>>;
  }
> = ({ value, setValue, isLoading, children }) => {
  const skip = useCallback((event: React.MouseEvent | React.TouchEvent | React.FocusEvent) => {
    event.stopPropagation();
  }, []);

  const onToggle = useCallback(
    (event: React.MouseEvent) => {
      if (isLoading) {
        return;
      }
      skip(event);
      setValue((last) => !last);
    },
    [setValue, isLoading, skip],
  );

  return (
    <Styled.ToggleContainer
      onClick={onToggle}
      isLoading={isLoading}
      onMouseMove={skip}
      onMouseOver={skip}
      onFocus={skip}
      onMouseOut={skip}
      onBlur={skip}
      onTouchStart={skip}
      onTouchMove={skip}
      onTouchEnd={skip}
    >
      <Styled.CheckBox enabled={value} />
      <span>{children}</span>
    </Styled.ToggleContainer>
  );
};
