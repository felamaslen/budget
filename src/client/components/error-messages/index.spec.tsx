import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ErrorMessages } from '.';
import { errorClosed, errorRemoved } from '~client/actions';
import { ErrorLevel, ERROR_CLOSE_TIME, ERROR_MESSAGE_DELAY } from '~client/constants/error';
import { renderWithStore } from '~client/test-utils';

describe('<ErrorMessages />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  const setup = (): ReturnType<typeof renderWithStore> =>
    renderWithStore(<ErrorMessages />, {
      customState: {
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
      },
    });

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
      const setupClick = (): ReturnType<typeof renderWithStore> => {
        const renderResult = setup();
        userEvent.click(renderResult.getByText(text));
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
      const setupMouseover = (): ReturnType<typeof renderWithStore> => {
        const renderResult = setup();
        userEvent.hover(renderResult.getByText(text));
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
