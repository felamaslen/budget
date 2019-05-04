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
    const [response, setResponse] = useState(null);

    const onError = useCallback(err => {
        setError(err);
    }, []);

    const onComplete = useCallback(() => {
        setLoading(false);
    }, []);

    const onSuccessHandler = useCallback((data, id) => {
        setResponse(data);
        onSuccess(data, id);
    }, [onSuccess]);

    useEffect(() => () => {
        if (source.current) {
            source.current.cancel('Component unmounted');
        }
    }, []);

    const makeRequest = useMemo(() => buildMakeRequest({
        method,
        url,
        apiKey,
        onSuccess: onSuccessHandler,
        onError,
        onComplete
    }), [method, url, apiKey, onSuccessHandler, onError, onComplete]);

    const initiateRequest = useCallback((...args) => {
        if (source.current) {
            source.current.cancel('Another request made');
        }

        source.current = axios.CancelToken.source();

        setLoading(true);
        makeRequest(source.current, ...args);
    }, [makeRequest]);

    return [initiateRequest, loading, error, response];
}

export function useCrud({
    url,
    apiKey
}) {
    const [data, setData] = useState([]);

    const onSetSingleItem = useCallback(item => {
        const index = data.findIndex(({ id }) => id === item.id);
        if (index === -1) {
            setData([...data, item]);
        } else {
            setData(data.slice(0, index)
                .concat([item])
                .concat(data.slice(index + 1))
            );
        }
    }, [data]);

    const [onCreate, loadingCreate, errorCreate, responseCreate] = useApi({
        method: 'post',
        url,
        apiKey
    });

    useEffect(() => {
        if (responseCreate) {
            setData([...data, responseCreate]);
        }
    }, [responseCreate, data]);

    const handleRead = useCallback((res, id) => {
        if (!id) {
            setData(res);
        }
    }, []);

    const [onRead, loadingRead, errorRead, responseRead] = useApi({
        method: 'get',
        url,
        apiKey,
        onSuccess: handleRead
    });

    useEffect(() => {
        if (!responseRead) {
            return;
        }
        if (Array.isArray(responseRead)) {
            setData(responseRead);
        } else {
            onSetSingleItem(responseRead);
        }
    }, [responseRead, onSetSingleItem]);

    const [onUpdate, loadingUpdate, errorUpdate, responseUpdate] = useApi({
        method: 'put',
        url,
        apiKey
    });

    useEffect(() => {
        if (responseUpdate) {
            onSetSingleItem(responseUpdate);
        }
    }, [responseUpdate, onSetSingleItem]);

    const [deletedId, setDeletedId] = useState(null);

    useEffect(() => {
        if (deletedId) {
            setData(data.filter(({ id }) => id !== deletedId));
        }
    }, [data, deletedId]);

    const handleDelete = useCallback((res, id) => {
        setDeletedId(id);
    }, []);

    const [onDelete, loadingDelete, errorDelete] = useApi({
        method: 'delete',
        url,
        apiKey,
        onSuccess: handleDelete
    });

    const loading = loadingCreate || loadingRead || loadingUpdate || loadingDelete;
    const error = errorCreate || errorRead || errorUpdate || errorDelete;

    return [data, loading, error, onCreate, onRead, onUpdate, onDelete];
}
