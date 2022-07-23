import { act, renderHook, RenderHookResult } from '@testing-library/react';
import type { Dispatch, SetStateAction } from 'react';

import { usePersistentState, PersistentStateValidator as Validator } from './persist';

describe('usePersistentState', () => {
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeAll(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation();
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
  });

  beforeEach(jest.useFakeTimers);
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });

    getItemSpy.mockReset();
    setItemSpy.mockReset();
  });

  type MyState = {
    some: string;
    thing: number;
    complex: ['yes', { it: 'is' | 'is not' }];
  };

  const defaultState: MyState = {
    some: 'foo',
    thing: 3,
    complex: ['yes', { it: 'is' }],
  };

  const setup = (
    validator?: Validator<MyState> | null,
  ): RenderHookResult<
    [MyState, Dispatch<SetStateAction<MyState>>],
    Parameters<typeof usePersistentState>
  > => renderHook(() => usePersistentState(defaultState, 'my-persistent-state-key', validator));

  it('should return the current state', () => {
    expect.assertions(1);

    const { result } = setup();
    expect(result.current[0]).toStrictEqual<MyState>({
      some: 'foo',
      thing: 3,
      complex: ['yes', { it: 'is' }],
    });
  });

  it('should set the new state (immediately)', () => {
    expect.assertions(1);

    const { result } = setup();

    act(() => {
      result.current[1]({
        some: 'foo',
        thing: -1,
        complex: ['yes', { it: 'is not' }],
      });
    });

    expect(result.current[0]).toStrictEqual<MyState>({
      some: 'foo',
      thing: -1,
      complex: ['yes', { it: 'is not' }],
    });
  });

  it('should allow setting state through passing a function', () => {
    expect.assertions(2);

    const { result } = setup();

    act(() => {
      result.current[1](
        (last: MyState): MyState => ({
          ...last,
          thing: last.thing + 1,
        }),
      );
    });

    expect(result.current[0]).toStrictEqual<MyState>({
      some: 'foo',
      thing: 4,
      complex: ['yes', { it: 'is' }],
    });

    act(() => {
      result.current[1](
        (last: MyState): MyState => ({
          ...last,
          thing: last.thing + 1,
        }),
      );
    });

    expect(result.current[0]).toStrictEqual<MyState>({
      some: 'foo',
      thing: 5,
      complex: ['yes', { it: 'is' }],
    });
  });

  it('should call localStorage.setItem after setting state', () => {
    expect.assertions(3);

    const { result } = setup();

    act(() => {
      result.current[1]({
        some: 'foo',
        thing: -1,
        complex: ['yes', { it: 'is not' }],
      });
    });

    expect(setItemSpy).toHaveBeenCalledTimes(0);

    act(() => {
      jest.runAllTimers();
    });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalledWith(
      'my-persistent-state-key',
      JSON.stringify({
        some: 'foo',
        thing: -1,
        complex: ['yes', { it: 'is not' }],
      }),
    );
  });

  it('should debounce the call to setItem', () => {
    expect.assertions(1);

    const { result } = setup();

    const incrementState = (): void => {
      result.current[1]((last) => ({
        ...last,
        thing: last.thing + 1,
      }));
    };

    act(() => {
      incrementState();
      incrementState();
      incrementState();
    });
    act(() => {
      jest.runAllTimers();
    });

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should load state using getItem if possible', () => {
    expect.assertions(1);

    const customValue: MyState = {
      some: 'bar',
      thing: 90,
      complex: ['yes', { it: 'is' }],
    };

    getItemSpy.mockImplementationOnce((key: string): string | null =>
      key === 'my-persistent-state-key' ? JSON.stringify(customValue) : null,
    );

    const { result } = setup();

    expect(result.current[0]).toStrictEqual(customValue);
  });

  it('should accept an optional validator', () => {
    expect.assertions(1);

    const customValue = {
      really: 'INVALID',
      foo: ['never gonna parse'],
    };

    const validator = (value: unknown | MyState): value is MyState =>
      Reflect.has((value as Record<string, unknown>) ?? {}, 'some');

    getItemSpy.mockReturnValueOnce(JSON.stringify(customValue));

    const { result } = setup(validator);

    expect(result.current[0]).toStrictEqual({
      some: 'foo',
      thing: 3,
      complex: ['yes', { it: 'is' }],
    });
  });

  describe('when the validator is explicitly omitted', () => {
    it('should treat the default state as the initial state', () => {
      expect.assertions(1);

      const customValue: MyState = {
        some: 'valid',
        thing: 23,
        complex: ['yes', { it: 'is not' }],
      };

      getItemSpy.mockReturnValueOnce(JSON.stringify(customValue));

      const { result } = setup(null);

      expect(result.current[0]).toStrictEqual(defaultState);
    });
  });
});
