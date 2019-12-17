import createReducer from '~/reducers/create-reducer';
import { ERRORED } from '~/constants/actions.rt';
import { SocketAction, ErrorAction } from '~/actions/types';

const ACTION1 = 'ACTION1';
const ACTION2 = 'ACTION2';

interface TestState {
  foo: string;
  bar: number;
  foobar: number | null;
}

const initialState = {
  foo: 'initial-foo',
  bar: 2,
  foobar: null,
};

const testReducer = createReducer<TestState>({
  initialState,
  onError: (state: TestState, { payload: { error } }: ErrorAction) => ({
    foo: error,
    bar: 0,
    foobar: null,
  }),
  handlers: {
    [ACTION1]: (
      state: TestState,
      { payload }: SocketAction,
    ): { foo: string; foobar: number | null } => ({
      foo: String(payload),
      foobar: Number.isNaN(Number(payload)) ? null : Number(payload) * state.bar,
    }),
    [ACTION2]: (
      state: TestState,
      { payload }: SocketAction,
    ): { bar: number; foobar: number | null } => ({
      bar: Number(payload),
      foobar: Number.isNaN(Number(state.foo)) ? null : Number(state.foo) * Number(payload),
    }),
  },
});

test('Action1 has the desired result', () => {
  const result1: TestState = testReducer(initialState, {
    type: ACTION1,
    payload: 'some foo',
  });

  expect(result1).toStrictEqual({
    foo: 'some foo',
    bar: 2,
    foobar: null,
  });

  const result2: TestState = testReducer(initialState, {
    type: ACTION1,
    payload: '34',
  });

  expect(result2).toStrictEqual({
    foo: '34',
    bar: 2,
    foobar: 68,
  });
});

test('Action2 has the desired result', () => {
  const result1: TestState = testReducer(initialState, {
    type: ACTION2,
    payload: 17,
  });

  expect(result1).toStrictEqual({
    foo: 'initial-foo',
    bar: 17,
    foobar: null,
  });

  const result2: TestState = testReducer(
    testReducer(initialState, {
      type: ACTION1,
      payload: '17',
    }),
    {
      type: ACTION2,
      payload: 3,
    },
  );

  expect(result2).toStrictEqual({
    foo: '17',
    bar: 3,
    foobar: 51,
  });
});

test('Errors are handled', () => {
  const result: TestState = testReducer(initialState, {
    type: ERRORED,
    payload: {
      error: 'Some error occurred',
    },
  });

  expect(result).toStrictEqual({
    foo: 'Some error occurred',
    bar: 0,
    foobar: null,
  });
});
