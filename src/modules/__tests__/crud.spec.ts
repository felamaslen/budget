import { fieldExists, crudReducer } from '~/modules/crud';
import { ERRORED } from '~/constants/actions.rt';

test('fieldExists returns true iff the value is defined and not a zero-length string', () => {
  expect.assertions(6);

  expect(fieldExists(0)).toBe(true);
  expect(fieldExists()).toBe(false);
  expect(fieldExists(undefined)).toBe(false);
  expect(fieldExists('yes')).toBe(true);
  expect(fieldExists('')).toBe(false);
  expect(fieldExists(null)).toBe(false);
});

test('crudReducer makes a reducer which responds to actions', () => {
  expect.assertions(3);

  type MyItem = {
    id: string;
    foo: number;
  };

  type MyState = {
    items: MyItem[];
  };

  const ACTION1 = 'ACTION1';

  const { reducer, initialState } = crudReducer<MyItem>({
    handlers: {
      [ACTION1]: {
        onSend: () => (): Partial<MyState> => ({
          items: [{ id: 'yes', foo: 3 }],
        }),
        onReceive: () => (): Partial<MyState> => ({
          items: [{ id: 'no', foo: 2 }],
        }),
        onError: () => (): Partial<MyState> => ({
          items: [{ id: 'wat', foo: 3012 }],
        }),
      },
    },
  });

  const action1Send = {
    type: ACTION1,
    __FROM_SOCKET__: false,
  };

  const action1Receive = {
    type: ACTION1,
    __FROM_SOCKET__: true,
  };

  const errored = {
    type: ERRORED,
    __FROM_SOCKET__: true,
    actionType: ACTION1,
  };

  const resultSend = reducer(initialState, action1Send);
  expect(resultSend.items).toStrictEqual([{ id: 'yes', foo: 3 }]);

  const resultReceive = reducer(initialState, action1Receive);
  expect(resultReceive.items).toStrictEqual([{ id: 'no', foo: 2 }]);

  const resultErrored = reducer(initialState, errored);
  expect(resultErrored.items).toStrictEqual([{ id: 'wat', foo: 3012 }]);
});
