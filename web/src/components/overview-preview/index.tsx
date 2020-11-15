import { AxiosInstance, AxiosResponse } from 'axios';
import React, { useState, useEffect, useCallback } from 'react';

import * as Styled from './styles';
import { API_PREFIX } from '~client/constants/data';
import { useCancellableRequest } from '~client/hooks';
import { PageListCalc } from '~client/types';

export type Query = {
  year: number;
  month: number;
  category: PageListCalc;
};

type Props = {
  query: Query | null;
};

const sendRequest = async (
  axios: AxiosInstance,
  params: Query,
): Promise<AxiosResponse<ArrayBuffer>> =>
  axios.get<ArrayBuffer>(`${API_PREFIX}/preview`, {
    params,
    responseType: 'arraybuffer',
  });

export const OverviewPreview: React.FC<Props> = ({ query }) => {
  const [url, setUrl] = useState<string | null>(null);

  const handleResponse = useCallback((res: ArrayBuffer): void => {
    const image = btoa(
      new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), ''),
    );
    setUrl(`data:image/png;base64,${image}`);
  }, []);

  const onClear = useCallback(() => {
    setUrl(null);
  }, []);

  const loading = useCancellableRequest<Query | null, ArrayBuffer, Query>({
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
    <Styled.Preview left={position.left} top={position.top}>
      {url && <img src={url} alt="Preview" />}
    </Styled.Preview>
  );
};
