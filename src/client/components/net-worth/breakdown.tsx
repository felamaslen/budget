/** @jsx jsx */
import { jsx } from '@emotion/react';
import { rem } from 'polished';
import {
  FC,
  Fragment,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './breakdown.styles';

import { BlockName, BlockPacker } from '~client/components/block-packer';
import { ResizeContext } from '~client/hooks';
import { blockPacker } from '~client/modules/block-packer';
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

  const [{ width, height }, setDimensions] = useState<{ width: number; height: number }>({
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

  const blocks = useSelector(getNetWorthBreakdown(entry, width, height));
  const blockTree = useMemo(
    () => (blocks ? blockPacker(width, height, blocks) : null),
    [width, height, blocks],
  );

  const nextEntry = useCallback(() => switchEntry(1), [switchEntry]);
  const prevEntry = useCallback(() => switchEntry(-1), [switchEntry]);
  const exit = useCallback(() => switchEntry(0), [switchEntry]);

  const [status, setStatus] = useState<ReactElement | null>(null);
  const onHover = useCallback((...names: BlockName[]): void => {
    setStatus(
      <Fragment>
        {names
          .filter((part: BlockName): part is string => !!part)
          .map((part, index) => (
            <span css={{ fontSize: rem(16 - index) }} key={part}>
              {index > 0 ? ' - ' : ''}
              {part}
            </span>
          ))}
      </Fragment>,
    );
  }, []);

  return (
    <Styled.BreakdownContainer ref={container}>
      <Styled.TitleContainer>
        <Button onClick={prevEntry}>
          <Styled.NavBack />
        </Button>
        <Button onClick={exit}>
          <Styled.NavExit />
        </Button>
        <Styled.Title>{`Breakdown - ${toISO(entry.date)}`}</Styled.Title>
        <Button onClick={nextEntry}>
          <Styled.NavNext />
        </Button>
      </Styled.TitleContainer>
      {blockTree && <BlockPacker blocks={blockTree} status={status} onHover={onHover} />}
    </Styled.BreakdownContainer>
  );
};
