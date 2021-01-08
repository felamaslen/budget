/** @jsx jsx */
import { jsx } from '@emotion/react';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './breakdown.styles';

import { BlockPacker } from '~client/components/block-packer';
import { ResizeContext } from '~client/hooks';
import { toISO } from '~client/modules/format';
import { getNetWorthBreakdown } from '~client/selectors';
import { Button } from '~client/styled/shared';
import type { NetWorthEntryNative } from '~client/types';

export type Props = {
  entry: NetWorthEntryNative;
  switchEntry: (delta: -1 | 0 | 1) => void;
};

export const NetWorthBreakdown: FC<Props> = ({ entry, switchEntry }) => {
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

  const blocks = useSelector(getNetWorthBreakdown(entry, dimensions.width, dimensions.height));

  const nextEntry = useCallback(() => switchEntry(1), [switchEntry]);
  const prevEntry = useCallback(() => switchEntry(-1), [switchEntry]);
  const exit = useCallback(() => switchEntry(0), [switchEntry]);

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

  return (
    <Styled.BreakdownContainer ref={container}>
      <Styled.TitleContainer>
        <Button onClick={exit}>Back</Button>
        <Button onClick={prevEntry}>Previous</Button>
        <Styled.Title>{`Net worth breakdown - ${toISO(entry.date)}`}</Styled.Title>
        <Button onClick={nextEntry}>Next</Button>
      </Styled.TitleContainer>
      {blocks && <BlockPacker blocks={blocks} status={status} onHover={onHover} />}
    </Styled.BreakdownContainer>
  );
};
