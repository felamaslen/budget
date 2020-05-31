import axios from 'axios';
import { testSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import appSaga, { fetchLegacy, fetchNetWorth, fetchData } from './app';
import { getFundHistoryQuery } from './funds';
import { dataRead } from '~client/actions/api';
import { errorOpened } from '~client/actions/error';
import { ActionTypeLogin } from '~client/actions/login';
import { API_PREFIX } from '~client/constants/data';
import { getApiKey } from '~client/selectors/api';
import { testResponse } from '~client/test-data';
import { Page } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'my-short-id',
}));

describe('App saga', () => {
  it('fetchLegacy calls GET /data/all with fund query options', () => {
    expect.assertions(0);
    const res = {
      data: {
        data: { isRes: true },
      },
      headers: {},
    };

    testSaga(fetchLegacy, 'some-api-key')
      .next()
      .call(getFundHistoryQuery)
      .next({ period: 'month', length: 6, history: true })
      .call(axios.get, `${API_PREFIX}/data/all?period=month&length=6&history=true`, {
        headers: {
          Authorization: 'some-api-key',
        },
      })
      .next(res)
      .returns(res.data.data);
  });

  it('fetchNetWorth gets categories, subcategories and entries', () => {
    expect.assertions(0);
    const resCategories = { isCategoryRes: true };
    const resSubcategories = { isSubcategoryRes: true };
    const resEntries = { count: 17, data: ['some-data'] };

    const options = { headers: { Authorization: 'some-api-key' } };

    testSaga(fetchNetWorth, 'some-api-key')
      .next()
      .all({
        categories: call(axios.get, `${API_PREFIX}/data/net-worth/categories`, options),
        subcategories: call(axios.get, `${API_PREFIX}/data/net-worth/subcategories`, options),
        entries: call(axios.get, `${API_PREFIX}/data/net-worth`, options),
      })
      .next({
        categories: resCategories,
        subcategories: resSubcategories,
        entries: resEntries,
      })
      .returns({
        categories: resCategories,
        subcategories: resSubcategories,
        entries: resEntries,
      });
  });

  it('fetchData gets all data from the API', () => {
    expect.assertions(0);
    const resLegacy = {
      [Page.bills]: {
        data: [],
        total: 193,
      },
    };
    const resNetWorth = {
      categories: {
        data: [],
      },
      subcategories: {
        data: [],
      },
      entries: {
        data: {
          items: [],
          old: [],
        },
      },
    };

    const err = new Error('something bad happened');

    testSaga(fetchData)
      .next()
      .select(getApiKey)
      .next('some-api-key')
      .all({
        legacy: call(fetchLegacy, 'some-api-key'),
        netWorth: call(fetchNetWorth, 'some-api-key'),
      })
      .next({
        legacy: { ...testResponse, ...resLegacy },
        netWorth: resNetWorth,
      })
      .put(dataRead({ ...testResponse, ...resLegacy, netWorth: resNetWorth }))
      .next()
      .isDone();

    testSaga(fetchData)
      .next()
      .select(getApiKey)
      .next('some-api-key')
      .all({
        legacy: call(fetchLegacy, 'some-api-key'),
        netWorth: call(fetchNetWorth, 'some-api-key'),
      })
      .throw(err)
      .put(errorOpened('Error loading data: something bad happened'))
      .next()
      .isDone();
  });

  it('appSaga forks other sagas', () => {
    expect.assertions(0);
    testSaga(appSaga).next().takeLatest(ActionTypeLogin.LoggedIn, fetchData).next().isDone();
  });
});
