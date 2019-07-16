import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import { NULL, replaceAtIndex } from '~client/modules/data';
import { API_PREFIX } from '~client/constants/data';

function buildMakeRequest({ method, url, apiKey, onSuccess, onError, onComplete }) {
    return async (source, id = null, params = {}, data = null, done = null) => {
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

            if (done) {
                done();
            }
        }
    };
}

export function useApi({
    method = 'get',
    url,
    apiKey,
    onSuccess = NULL
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

function useResponseOp(url, apiKey, setResponse, method, query = null) {
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

    const triggerWithQuery = useMemo(() => {
        if (query) {
            return (id, params, data, done) => onTrigger(id, params || query, data, done);
        }

        return onTrigger;
    }, [query, onTrigger]);

    useEffect(() => {
        if (response) {
            setResponse(response);
            setTempResponse(null);
        }
    }, [response, setResponse]);

    return [triggerWithQuery, loading, error];
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

export function useCrud({
    url,
    numPerPage = null,
    apiKey
}) {
    const [page, setPage] = useState(0);
    const [prevPage, setPrevPage] = useState(0);
    const [numPages, setNumPages] = useState(null);
    const [prevPages, setPrevPages] = useState(null);

    const [data, setData] = useState([]);
    const setResponse = useCallback(response => {
        let item = response;
        if (numPerPage && Array.isArray(response.data)) {
            item = response.data;

            setNumPages(Math.ceil(response.count / numPerPage));
        }
        if (Array.isArray(item)) {
            return setData(item);
        }

        const index = data.findIndex(({ id }) => id === item.id);
        if (index === -1) {
            return setData([...data, item]);
        }

        return setData(replaceAtIndex(data, index, item));
    }, [data, numPerPage]);

    useEffect(() => {
        if (numPages !== prevPages) {
            setPage(0);
            setPrevPages(numPages);
        }
    }, [numPages, prevPages]);

    const [onCreate, loadingCreate, errorCreate] = useResponseOp(url, apiKey, setResponse, 'post');

    const readQuery = useMemo(() => {
        if (numPerPage) {
            return { page, limit: numPerPage };
        }

        return null;
    }, [numPerPage, page]);

    const [onRead, loadingRead, errorRead] = useResponseOp(url, apiKey, setResponse, 'get', readQuery);
    const [onUpdate, loadingUpdate, errorUpdate] = useResponseOp(url, apiKey, setResponse, 'put');
    const [onDelete, loadingDelete, errorDelete] = useDelete(url, apiKey, data, setData);

    useEffect(() => {
        if (numPerPage && page !== prevPage) {
            onRead();
            setPrevPage(page);
        }
    }, [numPerPage, page, prevPage, onRead]);

    const loading = loadingCreate || loadingRead || loadingUpdate || loadingDelete;
    const error = errorCreate || errorRead || errorUpdate || errorDelete;

    return [data, loading, error, onCreate, onRead, onUpdate, onDelete, page, setPage, numPages];
}
