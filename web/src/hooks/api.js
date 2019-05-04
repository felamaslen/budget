import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import { API_PREFIX } from '~client/constants/data';

function buildMakeRequest({ method, url, apiKey, onSuccess, onError, onComplete }) {
    return async (source, id = null, params = {}, data = null) => {
        try {
            let requestUrl = `${API_PREFIX}/${url}`;
            if (id) {
                requestUrl += `/${id}`;
            }

            const res = await axios({
                cancelToken: source.token,
                method,
                url: requestUrl,
                headers: {
                    Authorization: apiKey
                },
                params,
                data
            });

            onSuccess(res.data, id);
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

function useResponseOp(url, apiKey, setResponse, method) {
    const [response, setTempResponse] = useState(null);
    const handleResponse = useCallback(res => {
        setTempResponse(res);
    }, []);

    const [onTrigger, loading, error] = useApi({
        method,
        url,
        apiKey,
        onSuccess: handleResponse
    });

    useEffect(() => {
        if (response) {
            setResponse(response);
            setTempResponse(null);
        }
    }, [response, setResponse]);

    return [onTrigger, loading, error];
}

function useDelete(url, apiKey, data, setData) {
    const [deletedId, setDeletedId] = useState(null);
    const handleDelete = useCallback((res, id) => {
        setDeletedId(id);
    }, []);

    const [onDelete, loading, error] = useApi({
        method: 'delete',
        url,
        apiKey,
        onSuccess: handleDelete
    });

    useEffect(() => {
        if (deletedId) {
            setData(data.filter(({ id }) => id !== deletedId));
            setDeletedId(null);
        }
    }, [data, setData, deletedId]);

    return [onDelete, loading, error];
}

export function useCrud({ url, apiKey }) {
    const [data, setData] = useState([]);
    const setResponse = useCallback(item => {
        if (Array.isArray(item)) {
            return setData(item);
        }

        const index = data.findIndex(({ id }) => id === item.id);
        if (index === -1) {
            return setData([...data, item]);
        }

        return setData(data.slice(0, index)
            .concat([item])
            .concat(data.slice(index + 1))
        );
    }, [data]);

    const [onCreate, loadingCreate, errorCreate] = useResponseOp(url, apiKey, setResponse, 'post');
    const [onRead, loadingRead, errorRead] = useResponseOp(url, apiKey, setResponse, 'get');
    const [onUpdate, loadingUpdate, errorUpdate] = useResponseOp(url, apiKey, setResponse, 'put');
    const [onDelete, loadingDelete, errorDelete] = useDelete(url, apiKey, data, setData);

    const loading = loadingCreate || loadingRead || loadingUpdate || loadingDelete;
    const error = errorCreate || errorRead || errorUpdate || errorDelete;

    return [data, loading, error, onCreate, onRead, onUpdate, onDelete];
}
