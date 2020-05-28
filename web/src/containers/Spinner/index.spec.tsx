import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';

import { Spinner } from '.';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<Spinner />', () => {
  const state = {
    ...testState,
    api: {
      ...testState.api,
      initialLoading: true,
    },
  };

  const setup = (
    customProps = {},
    customState: State = state,
  ): RenderResult & {
    store: MockStore<State>;
  } => {
    const store = createStore<State>()(customState);

    const utils = render(
      <Provider store={store}>
        <Spinner {...customProps} />
      </Provider>,
    );

    return { store, ...utils };
  };

  it('should render a spinner', () => {
    expect.assertions(1);
    const { container } = setup();
    expect(container).toMatchInlineSnapshot(`
      .c0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        position: fixed;
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        -ms-flex-pack: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        z-index: 500;
        top: 49px;
        left: 0;
        background: rgba(255,255,255,0.8);
      }

      .c1 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        -ms-flex-pack: center;
        justify-content: center;
        width: 8rem;
        height: 8rem;
        position: relative;
        font-size: 6px;
        background: #fff;
        border-radius: 2em;
        box-shadow: inset 0 0 19px -3px rgba(0,0,0,0.2);
      }

      .c2 {
        display: inline-block;
        position: absolute;
        width: 5rem;
        height: 5rem;
        text-indent: -1000px;
        overflow: hidden;
        -webkit-animation: pqIDQ 1s infinite steps(8);
        animation: pqIDQ 1s infinite steps(8);
      }

      .c2::before,
      .c2::after {
        content: '';
        width: 0.5rem;
        height: 1.5rem;
        position: absolute;
        top: 0;
        left: 2.25rem;
        border-radius: 2px;
        background: #eaeaea;
        box-shadow: 0 3.5rem #eaeaea;
        -webkit-transform-origin: 50% 2.5rem;
        -ms-transform-origin: 50% 2.5rem;
        transform-origin: 50% 2.5rem;
      }

      .c2::before {
        background: #2e2e2e;
      }

      .c2::after {
        -webkit-transform: rotate(-45deg);
        -ms-transform: rotate(-45deg);
        transform: rotate(-45deg);
        background: #5e5e5e;
      }

      .c3 {
        display: inline-block;
        position: absolute;
        width: 5rem;
        height: 5rem;
        text-indent: -1000px;
        overflow: hidden;
        -webkit-animation: klncaE 1s infinite steps(8);
        animation: klncaE 1s infinite steps(8);
      }

      .c3::before,
      .c3::after {
        content: '';
        width: 0.5rem;
        height: 1.5rem;
        position: absolute;
        top: 0;
        left: 2.25rem;
        border-radius: 2px;
        background: #eaeaea;
        box-shadow: 0 3.5rem #eaeaea;
        -webkit-transform-origin: 50% 2.5rem;
        -ms-transform-origin: 50% 2.5rem;
        transform-origin: 50% 2.5rem;
      }

      .c3::before {
        background: #8e8e8e;
      }

      .c3::after {
        -webkit-transform: rotate(-45deg);
        -ms-transform: rotate(-45deg);
        transform: rotate(-45deg);
        background: #bdbdbd;
      }

      <div>
        <div
          class="c0"
        >
          <div
            class="c1"
          >
            <div
              class="c2"
              offset="15"
            />
            <div
              class="c3"
              offset="105"
            />
          </div>
        </div>
      </div>
    `);
  });

  it('should not render if inactive', () => {
    expect.assertions(1);
    const { container } = setup(
      {},
      {
        ...state,
        api: {
          ...state.api,
          initialLoading: false,
        },
      },
    );
    expect(container).toMatchInlineSnapshot(`<div />`);
  });
});
