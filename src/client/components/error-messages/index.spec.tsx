import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';

import { ErrorMessages } from '.';
import { errorClosed, errorRemoved } from '~client/actions';
import { ErrorLevel, ERROR_CLOSE_TIME, ERROR_MESSAGE_DELAY } from '~client/constants/error';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<ErrorMessages />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  const state: State = {
    ...testState,
    error: [
      {
        id: 'f1101',
        message: { level: ErrorLevel.Err, text: 'foo' },
        closed: false,
      },
      {
        id: 'g1923',
        message: { level: ErrorLevel.Warn, text: 'bar' },
        closed: false,
      },
    ],
  };

  const setup = (
    customProps = {},
    customState: State = state,
  ): RenderResult & {
    store: MockStore;
  } => {
    const store = createStore<State>()(customState);

    const utils = render(
      <Provider store={store}>
        <ErrorMessages {...customProps} />
      </Provider>,
    );

    return { store, ...utils };
  };

  it('should render a list', () => {
    expect.assertions(1);
    const { getByRole } = setup();
    expect(getByRole('list')).toBeInTheDocument();
  });

  describe.each`
    id         | text
    ${'f1101'} | ${'foo'}
    ${'g1923'} | ${'bar'}
  `('the message with id $id', ({ id, text }) => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = setup();
      expect(getByText(text)).toBeInTheDocument();
    });

    describe('when clicked', () => {
      const setupClick = (): RenderResult & { store: MockStore } => {
        const renderResult = setup();
        act(() => {
          fireEvent.click(renderResult.getByText(text));
        });
        return renderResult;
      };

      it('should dispatch a fade action', () => {
        expect.assertions(1);
        const { store } = setupClick();

        expect(store.getActions()).toStrictEqual(expect.arrayContaining([errorClosed(id)]));
      });

      it('should dispatch a close action after a delay', () => {
        expect.assertions(1);
        const { store } = setupClick();

        act(() => {
          jest.advanceTimersByTime(ERROR_CLOSE_TIME);
        });

        expect(store.getActions()).toStrictEqual([errorClosed(id), errorRemoved(id)]);
      });
    });

    it('should close automatically after a delay', () => {
      expect.assertions(4);
      const { store } = setup();

      expect(store.getActions()).not.toStrictEqual(expect.arrayContaining([errorClosed(id)]));
      act(() => {
        jest.advanceTimersByTime(ERROR_MESSAGE_DELAY);
      });
      expect(store.getActions()).toStrictEqual(expect.arrayContaining([errorClosed(id)]));
      expect(store.getActions()).not.toStrictEqual(expect.arrayContaining([errorRemoved(id)]));
      act(() => {
        jest.advanceTimersByTime(ERROR_CLOSE_TIME);
      });
      expect(store.getActions()).toStrictEqual(expect.arrayContaining([errorRemoved(id)]));
    });

    describe('when mousing over', () => {
      const setupMouseover = (): RenderResult & { store: MockStore } => {
        const renderResult = setup();
        act(() => {
          fireEvent.mouseOver(renderResult.getByText(text));
        });
        return renderResult;
      };

      it('should prevent autoclose', () => {
        expect.assertions(2);
        const { store } = setupMouseover();

        act(() => {
          jest.advanceTimersByTime(ERROR_MESSAGE_DELAY);
        });
        act(() => {
          jest.advanceTimersByTime(ERROR_CLOSE_TIME);
        });
        expect(store.getActions()).not.toStrictEqual(expect.arrayContaining([errorClosed(id)]));
        expect(store.getActions()).not.toStrictEqual(expect.arrayContaining([errorRemoved(id)]));
      });
    });
  });
});
