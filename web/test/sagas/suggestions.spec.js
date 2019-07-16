/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import suggestionsSaga, {
    onRequest
} from '~client/sagas/suggestions';

import { getApiKey } from '~client/selectors/api';
import { API_PREFIX, MAX_SUGGESTIONS } from '~client/constants/data';

import { SUGGESTIONS_REQUESTED } from '~client/constants/actions/suggestions';
import { suggestionsRequested, suggestionsReceived, suggestionsCleared } from '~client/actions/suggestions';
import { errorOpened } from '~client/actions/error';

test('onRequest calls the API with a request for CRUD list suggestions', t => {
    const res = { data: { data: { isRes: true } } };

    testSaga(onRequest, suggestionsRequested('food', 'item', 'ab'))
        .next()
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/search/food/item/ab/${MAX_SUGGESTIONS}`, {
            headers: {
                Authorization: 'some api key'
            }
        })
        .next(res)
        .put(suggestionsReceived('item', res.data.data))
        .next()
        .isDone();

    t.pass();
});

test('onRequest handles errors', t => {
    const err = new Error('some error');

    const stub = sinon.stub(shortid, 'generate').returns('some-id');

    testSaga(onRequest, suggestionsRequested('food', 'item', 'ab'))
        .next()
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/search/food/item/ab/${MAX_SUGGESTIONS}`, {
            headers: {
                Authorization: 'some api key'
            }
        })
        .throw(err)
        .put(errorOpened('Error loading suggestions: some error'))
        .next()
        .put(suggestionsCleared())
        .next()
        .isDone();

    stub.restore();

    t.pass();
});

test('onRequest doesn\'t do anything if the page isn\'t a suggestions page', t => {
    testSaga(onRequest, suggestionsRequested('overview', 'item', 'ab'))
        .next()
        .isDone();

    t.pass();
});

test('suggestionsSaga calls the request saga in response to request action', t => {
    testSaga(suggestionsSaga)
        .next()
        .takeLatest(SUGGESTIONS_REQUESTED, onRequest)
        .next()
        .isDone();

    t.pass();
});
