import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';

import { GraphFundItem } from '.';
import { Data } from '~client/types';

describe('<GraphFundItem />', () => {
  const props = {
    id: '3',
    name: 'some-fund-graph',
    values: [
      [100, 42.3],
      [101, 41.2],
      [102, 45.9],
      [102.5, 46.9],
      [103, 0],
      [104, 47.1],
      [105, 46.9],
      [106, 42.5],
    ] as Data,
    sold: false,
    popout: true,
    onToggle: jest.fn(),
  };

  const setup = (customProps = {}): RenderResult =>
    render(<GraphFundItem {...props} {...customProps} />);

  it('should render a graph', () => {
    expect.assertions(1);
    const { container, getByRole } = setup();
    const button = getByRole('button');
    act(() => {
      fireEvent.focus(button);
    });
    expect(container).toMatchInlineSnapshot(`
      .c1 {
        display: inline-block;
      }

      .c2 {
        width: 100%;
        position: relative;
        z-index: 2;
      }

      .sc-pkhIR .c2 {
        position: relative;
        height: 125px;
      }

      @media only screen and (min-width:500px) {

      }

      @media only screen and (min-width:500px) {
        .c1 {
          height: 100%;
          -webkit-flex: 0 0 100px;
          -ms-flex: 0 0 100px;
          flex: 0 0 100px;
          outline: none;
          z-index: 2;
        }

        .c1:focus {
          box-shadow: inset 0 0 1px 1px #09e;
          z-index: 5;
        }

        .c1:focus svg {
          position: absolute;
          background: rgba(255,255,255,0.8);
          box-shadow: 0 3px 7px rgba(0,0,0,0.2);
          width: 300px;
          height: 120px;
        }

        .sc-fzoLag:nth-last-child(-n + 3) .c1 svg {
          top: initial;
          bottom: 0;
        }
      }

      @media only screen and (min-width:500px) {

      }

      @media only screen and (min-width:500px) {
        .c0 .biexlM {
          z-index: 10;
          width: 100px;
          height: 100%;
          position: static;
          background: transparent;
          box-shadow: none;
        }
      }

      @media only screen and (min-width:1200px) {

      }

      @media only screen and (min-width:500px) {
        .sc-pkhIR .c2 {
          height: 100%;
        }
      }

      @media only screen and (min-width:500px) {
        .c2 {
          display: inline-block;
          position: static;
          width: 300px;
          height: 120px;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        }

        .c0 .c2 {
          z-index: 10;
          width: 100px;
          height: 100%;
          position: static;
          background: transparent;
          box-shadow: none;
        }
      }

      @media only screen and (min-width:1200px) {
        .c2 {
          display: block;
        }
      }

      <div>
        <div
          class="c0 c1"
          data-testid="fund-graph"
          role="button"
          tabindex="0"
        >
          <div
            class="c2"
            height="120"
            width="300"
          >
            <svg
              data-testid="graph-svg"
              height="120"
              width="300"
            >
              <g>
                <text
                  color="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="0"
                  y="103.5"
                >
                  42.0p
                </text>
                <text
                  color="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="0"
                  y="63.5"
                >
                  44.0p
                </text>
                <text
                  color="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="0"
                  y="22.5"
                >
                  46.0p
                </text>
              </g>
              <g>
                <path
                  d="M0,97.6271186440679 Q18,94 25.0,97.6"
                  fill="none"
                  stroke="#0c3"
                  stroke-width="1.5"
                />
                <path
                  d="M25,97.6271186440679 C35,102 41,120 50.0,120.0 C59,120 70,108 75.0,97.6"
                  fill="none"
                  stroke="#c30"
                  stroke-width="1.5"
                />
                <path
                  d="M75,97.6271186440679 C87,74 88,48 100.0,24.4 Q105,15 125.0,4.1"
                  fill="none"
                  stroke="#0c3"
                  stroke-width="1.5"
                />
              </g>
              <g>
                <path
                  d="M200,0 Q216,-1 225.0,0.0"
                  fill="none"
                  stroke="#0c3"
                  stroke-width="1.5"
                />
                <path
                  d="M225,0 C234,1 245,-2 250.0,4.1 Q271,30 300.0,93.6"
                  fill="none"
                  stroke="#c30"
                  stroke-width="1.5"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    `);
  });

  it('should not render anything if there are no values', () => {
    expect.assertions(1);
    expect(setup({ values: [] }).container).toMatchInlineSnapshot(`<div />`);
  });
});
