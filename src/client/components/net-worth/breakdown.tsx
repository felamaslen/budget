/** @jsx jsx */
import { jsx } from '@emotion/react';
import {
  FC,
  forwardRef,
  PropsWithChildren,
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
import { toISO } from '~client/modules/format';
import { getNetWorthBreakdown } from '~client/selectors';
import type { NetWorthEntryNative } from '~client/types';

export type Props = {
  entry: NetWorthEntryNative;
};

type ContainerProps = {
  title: string;
};

const BreakdownContainer = forwardRef<HTMLDivElement, PropsWithChildren<ContainerProps>>(
  ({ children, title }, ref) => (
    <Styled.BreakdownContainer ref={ref}>
      <Styled.TitleContainer>
        <Styled.Title>{title}</Styled.Title>
      </Styled.TitleContainer>
      {children}
    </Styled.BreakdownContainer>
  ),
);

export const NetWorthBreakdown: FC<Props> = ({ entry }) => {
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
    <BreakdownContainer ref={container} title={`Net worth breakdown - ${toISO(entry.date)}`}>
      {blocks && <BlockPacker blocks={blocks} status={status} onHover={onHover} />}
    </BreakdownContainer>
  );
};
