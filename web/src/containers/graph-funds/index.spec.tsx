import sinon from 'sinon';
import React from 'react';
import { render, RenderResult, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import getStore from 'redux-mock-store';
import getUnixTime from 'date-fns/getUnixTime';

import { testState } from '~client/test-data/state';

import GraphFunds, { Props } from '.';
import { Page } from '~client/types/app';
import { Period } from '~client/constants/graph';
import { State } from '~client/reducers';

describe('<GraphFunds />', () => {
  const mockStore = getStore<State>();
  const getContainer = (props: Props): RenderResult =>
    render(
      <Provider
        store={mockStore({
          ...testState,
          [Page.funds]: {
            ...testState[Page.funds],
            items: [
              {
                id: 'some-fund-id',
                item: 'some fund',
                transactions: [
                  {
                    id: 'some-transaction-id',
                    date: new Date('2020-04-10'),
                    units: 100,
                    cost: 9960,
                  },
                ],
              },
            ],
            cache: {
              [Period.year1]: {
                startTime: getUnixTime(new Date('2020-04-20')),
                cacheTimes: [
                  getUnixTime(new Date('2020-04-20')),
                  getUnixTime(new Date('2020-05-20')),
                  getUnixTime(new Date('2020-06-16')),
                ],
                prices: {
                  'some-fund-id': {
                    values: [100, 99, 101],
                    startIndex: 0,
                  },
                },
              },
            },
          },
        })}
      >
        <GraphFunds {...props} />
      </Provider>,
    );

  it('should render differently when zooming', () => {
    expect.assertions(1);
    const clock = sinon.useFakeTimers();
    const { getByTestId } = getContainer({ isMobile: false });
    const graph = getByTestId('graph-svg') as HTMLElement;

    act(() => {
      // wait for listener to be added in the next event loop
      clock.tick(1);
    });

    act(() => {
      fireEvent.mouseMove(graph, { clientX: 100 });
    });

    const beforeZoom = getByTestId('graph-svg').innerHTML;

    act(() => {
      fireEvent.wheel(graph, { deltaY: -1 });
    });

    act(() => {
      // wait for throttled wheel handler to fire at least once
      clock.tick(11);
    });

    const afterZoom = getByTestId('graph-svg').innerHTML;

    expect(afterZoom).not.toBe(beforeZoom);
    clock.restore();
  });
});
