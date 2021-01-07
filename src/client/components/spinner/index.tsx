/* @jsx jsx */
import { jsx } from '@emotion/react';
import { useRef } from 'react';
import PuffLoader from 'react-spinners/PuffLoader';

import * as Styled from './styles';

function getInitialMountTime(): number {
  if (!('__MOUNT_TIME__' in window)) {
    return Date.now();
  }
  const value = window.__MOUNT_TIME__;
  Reflect.deleteProperty(window, '__MOUNT_TIME__');
  return value;
}

const SynchronisedSpinner: React.FC = () => {
  const mountTime = useRef<number>(getInitialMountTime());
  return (
    <PuffLoader loading={true} size={100} animationDelay={-(mountTime.current % 2000) / 1000} />
  );
};

export const Spinner: React.FC = () => (
  <Styled.Outer>
    <SynchronisedSpinner />
  </Styled.Outer>
);
