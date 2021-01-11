/* @jsx jsx */
import { jsx } from '@emotion/react';
import { createContext, Dispatch, SetStateAction, useContext, useEffect } from 'react';
import PuffLoader from 'react-spinners/PuffLoader';

import * as Styled from './styles';

export const Spinner: React.FC = () => (
  <Styled.Outer>
    <PuffLoader />
  </Styled.Outer>
);

export const SpinnerContext = createContext<Dispatch<SetStateAction<number>> | undefined>(
  undefined,
);

export const SpinnerInit: React.FC = () => {
  const dispatch = useContext(SpinnerContext);
  useEffect(() => {
    dispatch?.((last) => last + 1);
    return (): void => dispatch?.((last) => last - 1);
  }, [dispatch]);
  return null;
};
