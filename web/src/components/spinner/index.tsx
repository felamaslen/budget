/* @jsx jsx */
import { jsx } from '@emotion/react';
import { useRef } from 'react';
import PuffLoader from 'react-spinners/PuffLoader';

import * as Styled from './styles';

export const Spinner: React.FC = () => {
  const mountTime = useRef<number>(Date.now());
  return (
    <Styled.Outer>
      <PuffLoader loading={true} size={100} animationDelay={-(mountTime.current % 2000) / 1000} />
    </Styled.Outer>
  );
};
