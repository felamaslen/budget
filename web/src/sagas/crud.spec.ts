import nock, { Scope } from 'nock';
import { testSaga, expectSaga, TestApi, TestApiWithEffectsTesters } from 'redux-saga-test-plan';
import { debounce, call } from 'redux-saga/effects';
import numericHash from 'string-hash';

import crudSaga, {
  updateLists,
  updateNetWorth,
  updateCrud,
  updateCrudFromAction,
  onFetchMoreListData,
} from './crud';
import {
  ListActionType,
  ActionTypeNetWorth,
  ActionTypeApi,
  syncRequested,
  syncLocked,
  syncUnlocked,
  syncReceived,
  syncErrorOccurred,
  syncAttempted,
  moreListDataRequested,
  moreListDataReceived,
  errorOpened,
} from '~client/actions';
import { API_PREFIX, API_BACKOFF_TIME, TIMER_UPDATE_SERVER } from '~client/constants/data';
import { ErrorLevel } from '~client/constants/error';
import { withoutId } from '~client/modules/data';
import reducer, { State } from '~client/reducers';
import { getLocked, getApiKey, getCrudRequests, getNetWorthRequests } from '~client/selectors';
import {
  CATEGORY_CASH,
  SUBCATEGORY_WALLET,
  SUBCATEGORY_CC,
  CATEGORY_MORTGAGE,
  ENTRY_BANK_HOUSE_RAW,
  testState,
} from '~client/test-data';
import {
  nockNetWorthCategory,
  nockNetWorthSubcategory,
  nockNetWorthEntry,
  testApiKey,
} from '~client/test-utils/nocks';
import { RequestType, Request, RequestWithResponse, Page } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-short-id',
}));

describe('Crud saga', () => {
  const listRequests: Request[] = [
    {
      type: RequestType.create,
      fakeId: numericHash('some-fake-id'),
      method: 'post',
      route: 'general',
      query: {},
      body: {
        date: '2019-07-04',
        item: 'some item',
        category: 'some category',
        cost: 2563,
        shop: 'some shop',
      },
    },
    {
      type: RequestType.update,
      id: numericHash('some-real-id'),
      method: 'put',
      route: 'food',
      query: {},
      body: {
        id: 'some-real-id',
        date: '2019-07-01',
      },
    },
    {
      type: RequestType.delete,
      id: numericHash('other-real-id'),
      method: 'delete',
      route: 'holiday',
      query: {},
      body: {
        id: 'other-real-id',
      },
    },
  ];

  const listHttpRequests = [
    {
      method: 'post',
      route: 'general',
      query: {},
      body: {
        date: '2019-07-04',
        item: 'some item',
        category: 'some category',
        cost: 2563,
        shop: 'some shop',
      },
    },
    {
      method: 'put',
      route: 'food',
      query: {},
      body: {
        id: 'some-real-id',
        date: '2019-07-01',
      },
    },
    {
      method: 'delete',
      route: 'holiday',
      query: {},
      body: {
        id: 'other-real-id',
      },
    },
  ];

  const netWorthRequests: Request[] = [
    {
      type: RequestType.create,
      fakeId: numericHash('fake-category-id'),
      method: 'post',
      route: 'data/net-worth/categories',
      body: withoutId(CATEGORY_CASH),
    },
    {
      type: RequestType.delete,
      id: CATEGORY_MORTGAGE.id,
      method: 'delete',
      route: 'data/net-worth/categories',
    },
    {
      type: RequestType.create,
      fakeId: numericHash('fake-subcategory-id-a'),
      method: 'post',
      route: 'data/net-worth/subcategories',
      body: withoutId(SUBCATEGORY_WALLET),
    },
    {
      type: RequestType.update,
      id: SUBCATEGORY_CC.id,
      method: 'put',
      route: 'data/net-worth/subcategories',
      body: withoutId(SUBCATEGORY_CC),
    },
    {
      type: RequestType.update,
      id: ENTRY_BANK_HOUSE_RAW.id,
      method: 'put',
      route: 'data/net-worth',
      body: withoutId(ENTRY_BANK_HOUSE_RAW),
    },
  ];

  describe('updateLists', () => {
    it('should call the API with a request list', async () => {
      expect.assertions(1);
      const multiRes = {
        data: [{ isRes0: true }, { isRes1: true }, { isRes2: true }],
      };

      const requestScope = nock('http://localhost')
        .patch(`${API_PREFIX}/data/multiple`, {
          list: listHttpRequests,
        })
        .matchHeader('Authorization', 'some-api-key')
        .reply(200, multiRes);

      await expectSaga(updateLists, 'some-api-key', listRequests)
        .returns([
          { ...listRequests[0], res: multiRes.data[0] },
          { ...listRequests[1], res: multiRes.data[1] },
          { ...listRequests[2], res: multiRes.data[2] },
        ])
        .run();

      expect(requestScope.isDone()).toBe(true);
    });

    it('should do nothing if the request list is empty', () => {
      expect.assertions(0);
      testSaga(updateLists, 'some-api-key', []).next().returns([]);
    });
  });

  describe('updateNetWorth', () => {
    it('should call data/net-worth API endpoints', async () => {
      expect.assertions(5);

      const nocks: Scope[] = [
        nockNetWorthCategory.create(CATEGORY_CASH),
        nockNetWorthCategory.delete(CATEGORY_MORTGAGE),
        nockNetWorthSubcategory.create(SUBCATEGORY_WALLET),
        nockNetWorthSubcategory.update(SUBCATEGORY_CC),
        nockNetWorthEntry.update(ENTRY_BANK_HOUSE_RAW),
      ];

      const resList = [
        { data: CATEGORY_CASH }, // create
        { data: '' }, // delete category
        { data: SUBCATEGORY_WALLET }, // create
        { data: SUBCATEGORY_CC }, // update
        { data: ENTRY_BANK_HOUSE_RAW }, // update
      ];

      const expectedResult = netWorthRequests.map((request, index) => ({
        ...request,
        res: resList[index].data,
      }));

      await expectSaga(updateNetWorth, testApiKey, netWorthRequests).returns(expectedResult).run();

      nocks.forEach((scope) => {
        expect(scope.isDone()).toBe(true);
      });
    });

    it('should do nothing if the request list is empty', () => {
      expect.assertions(0);
      testSaga(updateNetWorth, 'some-api-key', []).next().returns([]);
    });
  });

  describe('updateCrud', () => {
    it('should call other update sagas', () => {
      expect.assertions(0);
      const resList: RequestWithResponse[] = [];
      const resNetWorth: RequestWithResponse[] = [];

      testSaga(updateCrud, syncAttempted())
        .next()
        .select(getCrudRequests)
        .next(listRequests)
        .select(getNetWorthRequests)
        .next(netWorthRequests)
        .put(syncLocked())
        .next()
        .select(getApiKey)
        .next(testApiKey)
        .put(syncRequested())
        .next()
        .all({
          list: call(updateLists, testApiKey, listRequests),
          netWorth: call(updateNetWorth, testApiKey, netWorthRequests),
        })
        .next({
          list: resList,
          netWorth: resNetWorth,
        })
        .put(
          syncReceived({
            list: resList,
            netWorth: resNetWorth,
          }),
        )
        .next()
        .put(syncAttempted(0, true))
        .next()
        .isDone();
    });

    it("shouldn't do anything if there are no requests", () => {
      expect.assertions(0);
      testSaga(updateCrud, syncAttempted())
        .next()
        .select(getCrudRequests)
        .next([])
        .select(getNetWorthRequests)
        .next([])
        .isDone();
    });

    describe('if the unlock option was set', () => {
      it('should unlock the sync if there are no requests', () => {
        expect.assertions(0);
        testSaga(updateCrud, syncAttempted(0, true))
          .next()
          .select(getCrudRequests)
          .next([])
          .select(getNetWorthRequests)
          .next([])
          .put(syncUnlocked())
          .next()
          .isDone();

        testSaga(updateCrud, syncAttempted(17, true))
          .next()
          .select(getCrudRequests)
          .next([])
          .select(getNetWorthRequests)
          .next([])
          .put(syncUnlocked())
          .next()
          .isDone();
      });
    });

    describe('if the unlock option was not set', () => {
      it('should not unlock the sync even if there were no requests', () => {
        expect.assertions(0);
        testSaga(updateCrud, syncAttempted(3, false))
          .next()
          .select(getCrudRequests)
          .next([])
          .select(getNetWorthRequests)
          .next([])
          .isDone();
      });
    });

    it('should handle API errors using exponential backoff', () => {
      expect.assertions(1);
      const err = new Error('some api error');

      expect(API_BACKOFF_TIME > 100).toBe(true);

      const toError = (saga: TestApi): TestApiWithEffectsTesters =>
        saga
          .next()
          .select(getCrudRequests)
          .next(listRequests)
          .select(getNetWorthRequests)
          .next(netWorthRequests)
          .put(syncLocked())
          .next()
          .select(getApiKey)
          .next('my-api-key')
          .put(syncRequested())
          .next()
          .all({
            list: call(updateLists, 'my-api-key', listRequests),
            netWorth: call(updateNetWorth, 'my-api-key', netWorthRequests),
          })
          .throw(err)
          .put(syncErrorOccurred([...listRequests, ...netWorthRequests], err))
          .next();

      toError(testSaga(updateCrud, syncAttempted()))
        .delay(API_BACKOFF_TIME)
        .next()
        .put(syncAttempted(1, true))
        .next()
        .isDone();

      toError(testSaga(updateCrud, syncAttempted(1, true)))
        .delay(API_BACKOFF_TIME * (3 / 2))
        .next()
        .put(syncAttempted(2, true))
        .next()
        .isDone();

      toError(testSaga(updateCrud, syncAttempted(2, true)))
        .delay(API_BACKOFF_TIME * (9 / 4))
        .next()
        .put(syncAttempted(3, true))
        .next()
        .isDone();

      toError(testSaga(updateCrud, syncAttempted(3)))
        .delay(API_BACKOFF_TIME * (27 / 8))
        .next()
        .put(syncAttempted(4, true))
        .next()
        .isDone();
    });

    it('should set a maximum of five minutes on the backoff delay', () => {
      expect.assertions(0);
      const err = new Error('some api error');

      testSaga(updateCrud, syncAttempted(1000000, true))
        .next()
        .select(getCrudRequests)
        .next(listRequests)
        .select(getNetWorthRequests)
        .next(netWorthRequests)
        .put(syncLocked())
        .next()
        .select(getApiKey)
        .next('my-api-key')
        .put(syncRequested())
        .next()
        .all({
          list: call(updateLists, 'my-api-key', listRequests),
          netWorth: call(updateNetWorth, 'my-api-key', netWorthRequests),
        })
        .throw(err)
        .put(syncErrorOccurred([...listRequests, ...netWorthRequests], err))
        .next()
        .delay(300000)
        .next()
        .put(syncAttempted(1000001, true))
        .next()
        .isDone();
    });
  });

  describe('updateCrudFromAction', () => {
    it('should call updateCrud', () => {
      expect.assertions(0);
      testSaga(updateCrudFromAction)
        .next()
        .select(getLocked)
        .next(false)
        .put(syncAttempted())
        .next()
        .isDone();
    });

    it("shouldn't do anything if the sync is locked", () => {
      expect.assertions(0);
      testSaga(updateCrudFromAction).next().select(getLocked).next(true).isDone();
    });
  });

  describe('onFetchMoreListData', () => {
    const page = Page.food;
    const state: State = {
      ...testState,
      api: {
        ...testState.api,
        key: 'some-api-key',
      },
      [page]: {
        ...testState[page],
        offset: 0,
        olderExists: true,
        loadingMore: false,
      },
    };

    const res = {
      data: {
        data: [
          {
            I: numericHash('id-1'),
            d: '2020-04-20',
            i: 'some item',
            k: 'some category',
            c: 123,
            s: 'some shop',
          },
        ],
        olderExists: true,
        total: 123456,
        weekly: 8765,
      },
    };

    it('should request more data for a page', async () => {
      expect.assertions(1);

      const requestScope = nock('http://localhost')
        .get(`${API_PREFIX}/data/${page}/1`)
        .matchHeader('Authorization', 'some-api-key')
        .reply(200, res);

      await expectSaga(onFetchMoreListData, moreListDataRequested(page))
        .withReducer(reducer, state)
        .put(moreListDataRequested(page))
        .put(moreListDataReceived(page, res.data))
        .run();

      expect(requestScope.isDone()).toBe(true);
    });

    describe('if the offset is on another page', () => {
      const stateWithOffset: State = {
        ...state,
        [page]: {
          ...state[page],
          offset: 23,
        },
      };

      it('should request the next page', async () => {
        expect.assertions(1);

        const requestScope = nock('http://localhost')
          .get(`${API_PREFIX}/data/${page}/24`)
          .matchHeader('Authorization', 'some-api-key')
          .reply(200, res);

        await expectSaga(onFetchMoreListData, moreListDataRequested(page))
          .withReducer(reducer, stateWithOffset)
          .put(moreListDataReceived(page, res.data))
          .run();

        expect(requestScope.isDone()).toBe(true);
      });
    });

    describe('if currently loading data', () => {
      const stateLoading: State = {
        ...state,
        [page]: {
          ...state[page],
          loadingMore: true,
        },
      };

      it('should not do anything', async () => {
        expect.assertions(1);

        const { allEffects } = await expectSaga(onFetchMoreListData, moreListDataRequested(page))
          .withReducer(reducer, stateLoading)
          .run();

        expect(allEffects.find(({ type }) => type === 'PUT')).toBeUndefined();
      });
    });

    describe('if no older items exist', () => {
      const stateAtEnd: State = {
        ...state,
        [page]: {
          ...state[page],
          olderExists: false,
        },
      };

      it('should not do anything', async () => {
        expect.assertions(1);

        const { allEffects } = await expectSaga(onFetchMoreListData, moreListDataRequested(page))
          .withReducer(reducer, stateAtEnd)
          .run();

        expect(allEffects.find(({ type }) => type === 'PUT')).toBeUndefined();
      });
    });

    describe('if an error occurs during the request', () => {
      it('should alert the user', async () => {
        expect.assertions(1);

        nock('http://localhost').get(`${API_PREFIX}/data/${page}/1`).reply(500);

        const { allEffects } = await expectSaga(onFetchMoreListData, moreListDataRequested(page))
          .withReducer(reducer, state)
          .put(moreListDataRequested(page))
          .put(errorOpened('Error fetching more data', ErrorLevel.Err))
          .run();

        expect(allEffects.filter(({ type }) => type === 'PUT')).toHaveLength(2);
      });
    });
  });

  it('should run a debounced sync', () => {
    expect.assertions(0);
    testSaga(crudSaga)
      .next()
      .is(
        debounce(
          TIMER_UPDATE_SERVER,
          [
            ListActionType.Created,
            ListActionType.Updated,
            ListActionType.Deleted,
            ActionTypeNetWorth.CategoryCreated,
            ActionTypeNetWorth.CategoryUpdated,
            ActionTypeNetWorth.CategoryDeleted,
            ActionTypeNetWorth.SubcategoryCreated,
            ActionTypeNetWorth.SubcategoryUpdated,
            ActionTypeNetWorth.SubcategoryDeleted,
            ActionTypeNetWorth.EntryCreated,
            ActionTypeNetWorth.EntryUpdated,
            ActionTypeNetWorth.EntryDeleted,
          ],
          updateCrudFromAction,
        ),
      )
      .next()
      .takeLatest(ActionTypeApi.SyncAttempted, updateCrud)
      .next()
      .takeLatest(ListActionType.MoreRequestInitiated, onFetchMoreListData)
      .next()
      .isDone();
  });
});
