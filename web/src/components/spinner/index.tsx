/* @jsx jsx */
import { jsx } from '@emotion/react';
import { useRef } from 'react';
import PuffLoader from 'react-spinners/PuffLoader';

import * as Styled from './styles';

const SynchronisedSpinner: React.FC = () => {
  const mountTime = useRef<number>(window.__MOUNT_TIME__ ?? 0);
  return (
    <PuffLoader loading={true} size={100} animationDelay={-(mountTime.current % 2000) / 1000} />
  );
};

export const Spinner: React.FC = () => (
  <Styled.Outer>
    <SynchronisedSpinner />
  </Styled.Outer>
);
