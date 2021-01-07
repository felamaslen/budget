/** @jsx jsx */
import { jsx } from '@emotion/react';
import { useState, useEffect, useCallback, useRef } from 'react';

import * as Styled from './styles';
import { API_PREFIX } from '~client/constants/data';
import { SendRequest, useCancellableRequest } from '~client/hooks';
import type { PageListCost } from '~client/types';

export type Query = {
  year: number;
  month: number;
  category: PageListCost;
};

type Props = {
  query: Query | null;
};

const sendRequest: SendRequest<Query> = (query: Query) => {
  const url = new URL(`${window.location.protocol}//${window.location.host}${API_PREFIX}/preview`);
  url.search = new URLSearchParams({
    year: String(query.year),
    month: String(query.month),
    category: query.category,
    width: String(Styled.width),
    height: String(Styled.height),
    scale: '2',
  }).toString();
  return { info: url.toString() };
};

export const OverviewPreview: React.FC<Props> = ({ query }) => {
  const [url, setUrl] = useState<string | null>(null);

  const cancelled = useRef<boolean>(false);
  const handleResponse = useCallback(async (res: Response) => {
    const data = await res.arrayBuffer();
    if (cancelled.current) {
      return;
    }
    const image = btoa(
      new Uint8Array(data).reduce((last, byte) => last + String.fromCharCode(byte), ''),
    );
    setUrl(`data:image/png;base64,${image}`);
  }, []);
  useEffect(
    () => (): void => {
      cancelled.current = true;
    },
    [],
  );

  const onClear = useCallback(() => {
    setUrl(null);
  }, []);

  const loading = useCancellableRequest<Query | null, Query>({
    query,
    sendRequest,
    handleResponse,
    onClear,
  });

  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const hasQuery = !!query;
  useEffect(() => {
    const listener = (event: MouseEvent): void => {
      setPosition({ left: event.pageX, top: event.pageY + 24 });
    };
    if (hasQuery) {
      window.addEventListener('mousemove', listener);
      return (): void => window.removeEventListener('mousemove', listener);
    }
    return (): void => {
      // pass
    };
  }, [hasQuery]);

  if (!url && !loading) {
    return null;
  }

  return (
    <Styled.Preview style={position}>
      <Styled.ImageContainer>{url && <img src={url} alt="Preview" />}</Styled.ImageContainer>
    </Styled.Preview>
  );
};
