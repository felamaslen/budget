import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import { API_PREFIX } from '~client/constants/data';

function buildMakeRequest({ method, url, apiKey, onSuccess, onError, onComplete }) {
    return async (source, params = {}, data = null) => {
        try {
            const res = await axios({
                cancelToken: source.token,
                method,
                url: `${API_PREFIX}/${url}`,
                headers: {
                    Authorization: apiKey
                },
                params,
                data
            });

            onSuccess(res.data);
        } catch (err) {
            onError(err);
        } finally {
            onComplete();
        }
    };
}

const noop = () => null;

export function useApi({
    method = 'get',
    url,
    apiKey,
    onSuccess = noop
}) {
    const source = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onError = useCallback(err => {
        setError(err);
    }, []);

    const onComplete = useCallback(() => {
        setLoading(false);
    }, []);

    useEffect(() => () => {
        if (source.current) {
            source.current.cancel('Component unmounted');
        }
    }, []);

    const makeRequest = useMemo(() => buildMakeRequest({
        method,
        url,
        apiKey,
        onSuccess,
        onError,
        onComplete
    }), [method, url, apiKey, onSuccess, onError, onComplete]);

    const initiateRequest = useCallback((...args) => {
        if (source.current) {
            source.current.cancel('Another request made');
        }

        source.current = axios.CancelToken.source();

        setLoading(true);
        makeRequest(source.current, ...args);
    }, [makeRequest]);

    return [initiateRequest, loading, error];
}
