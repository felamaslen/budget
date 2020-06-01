import { render, RenderResult, act, fireEvent } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import { usePersistentState, PersistentStateValidator as Validator } from './persist';

describe('usePersistentState', () => {
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeAll(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation();
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
  });

  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      clock.runAll();
    });
    clock.restore();

    getItemSpy.mockReset();
    setItemSpy.mockReset();
  });

  type MyState = {
    some: string;
    thing: number;
    complex: ['yes', { it: 'is' | 'is not' }];
  };

  const TestComponent: React.FC<{ validator?: Validator<MyState> }> = ({ validator }) => {
    const [state, setState] = usePersistentState<MyState>(
      {
        some: 'foo',
        thing: 3,
        complex: ['yes', { it: 'is' }],
      },
      'my-persistent-state-key',
      validator,
    );

    const testReplace = React.useCallback(() => {
      setState({
        some: 'foo',
        thing: -1,
        complex: ['yes', { it: 'is not' }],
      });
    }, [setState]);

    const testIncrement = React.useCallback(() => {
      setState(
        (last: MyState): MyState => ({
          ...last,
          thing: last.thing + 1,
        }),
      );
    }, [setState]);

    return (
      <div>
        <button data-testid="btn-replace" onClick={testReplace}>
          Replace
        </button>
        <button data-testid="btn-increment" onClick={testIncrement}>
          Increment
        </button>
        <pre data-testid="state">{JSON.stringify(state)}</pre>
      </div>
    );
  };

  const setup = (validator?: Validator<MyState>): RenderResult =>
    render(<TestComponent validator={validator} />);

  it('should return the current state', () => {
    expect.assertions(1);

    const { getByTestId } = setup();
    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual({
      some: 'foo',
      thing: 3,
      complex: ['yes', { it: 'is' }],
    });
  });

  it('should set the new state (immediately)', () => {
    expect.assertions(1);

    const { getByTestId } = setup();

    act(() => {
      fireEvent.click(getByTestId('btn-replace'));
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual({
      some: 'foo',
      thing: -1,
      complex: ['yes', { it: 'is not' }],
    });
  });

  it('should allow setting state through passing a function', () => {
    expect.assertions(2);

    const { getByTestId } = setup();

    act(() => {
      fireEvent.click(getByTestId('btn-increment'));
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual({
      some: 'foo',
      thing: 4,
      complex: ['yes', { it: 'is' }],
    });

    act(() => {
      fireEvent.click(getByTestId('btn-increment'));
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual({
      some: 'foo',
      thing: 5,
      complex: ['yes', { it: 'is' }],
    });
  });

  it('should call localStorage.setItem after setting state', () => {
    expect.assertions(3);

    const { getByTestId } = setup();

    act(() => {
      fireEvent.click(getByTestId('btn-replace'));
    });

    expect(setItemSpy).toHaveBeenCalledTimes(0);

    act(() => {
      clock.runAll();
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

    const { getByTestId } = setup();

    act(() => {
      fireEvent.click(getByTestId('btn-increment'));
    });
    act(() => {
      fireEvent.click(getByTestId('btn-increment'));
    });
    act(() => {
      fireEvent.click(getByTestId('btn-increment'));
    });
    act(() => {
      clock.runAll();
    });

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should load state using getItem if possible', () => {
    expect.assertions(1);

    const customValue = {
      some: 'bar',
      thing: 90,
      complex: ['yes', { it: 'is' }],
    };

    getItemSpy.mockImplementationOnce((key: string): string | null => {
      if (key === 'my-persistent-state-key') {
        return JSON.stringify(customValue);
      }

      return null;
    });

    const { getByTestId } = setup();

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(customValue);
  });

  it('should accept an optional validator', () => {
    expect.assertions(1);

    const customValue = {
      really: 'INVALID',
      foo: ['never gonna parse'],
    };

    const validator = (value: object | object[] | MyState): value is MyState =>
      Reflect.has(value ?? {}, 'some');

    getItemSpy.mockReturnValueOnce(JSON.stringify(customValue));

    const { getByTestId } = setup(validator);

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual({
      some: 'foo',
      thing: 3,
      complex: ['yes', { it: 'is' }],
    });
  });
});
