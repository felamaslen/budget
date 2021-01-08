/** @jsx jsx */
import { jsx } from '@emotion/react';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './breakdown.styles';

import { BlockPacker } from '~client/components/block-packer';
import { ResizeContext } from '~client/hooks';
import { getNetWorthBreakdown } from '~client/selectors';
import type { Id } from '~client/types';

export type Props = {
  id: Id;
  setId: Dispatch<SetStateAction<Id | null>>;
};

export const NetWorthBreakdown: FC<Props> = ({ id }) => {
  const container = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const windowWidth = useContext(ResizeContext);
  useEffect(() => {
    setDimensions({
      width: container.current?.offsetWidth ?? 0,
      height: container.current?.offsetHeight ?? 0,
    });
  }, [windowWidth]);

  const blocks = useSelector(getNetWorthBreakdown(id, dimensions.width, dimensions.height));

  const [status, setStatus] = useState<string>('');
  const onHover = useCallback((name?: string | null, subName?: string | null): void => {
    if (name) {
      if (subName) {
        setStatus(`${name} - ${subName}`);
      } else {
        setStatus(name);
      }
    } else {
      setStatus('');
    }
  }, []);

  if (!blocks) {
    return null;
  }

  return (
    <Styled.BreakdownContainer ref={container}>
      <BlockPacker blocks={blocks} status={status} onHover={onHover} />
    </Styled.BreakdownContainer>
  );
};
