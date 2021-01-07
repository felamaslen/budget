import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';

import { GraphFundItem, Props } from '.';

describe('<GraphFundItem />', () => {
  const props: Props = {
    name: 'some-fund-graph',
    values: [
      [
        [100, 42.3],
        [101, 41.2],
        [102, 45.9],
        [102.5, 46.9],
      ],
      [
        [104, 47.1],
        [105, 46.9],
        [106, 42.5],
      ],
    ],
    sold: false,
  };

  const setup = (customProps: Partial<Props> = {}): RenderResult =>
    render(<GraphFundItem {...props} {...customProps} />);

  it('should render a graph', () => {
    expect.assertions(1);
    const { container, getByRole } = setup();
    const button = getByRole('button');
    act(() => {
      fireEvent.focus(button);
    });
    expect(container).toMatchInlineSnapshot(`
      .emotion-0 {
        display: inline-block;
      }

      @media only screen and (min-width: 500px) {
        .emotion-0 {
          height: 100%;
          -webkit-flex: 0 0 6.25rem;
          -ms-flex: 0 0 6.25rem;
          flex: 0 0 6.25rem;
          outline: none;
          position: relative;
          z-index: 2;
        }

        .emotion-0:focus {
          box-shadow: inset 0 0 1px 1px #09e;
          z-index: 5;
        }

        .emotion-0:focus svg {
          position: absolute;
          background: rgba(255,255,255,0.8);
          box-shadow: 0 3px 7px rgba(0,0,0,0.2);
          width: 18.75rem;
          height: 120px;
        }

        .ejr3omo15:nth-last-of-type(-n + 3) .emotion-0 svg {
          top: initial;
          bottom: 0;
        }
      }

      @media only screen and (min-width: 500px) {
        .css-90x6gl-Graph {
          display: inline-block;
          position: static;
          width: 100px;
          height: 48px;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }

        .emotion-1 .css-90x6gl-Graph {
          z-index: 10;
          width: 100px;
          height: 100%;
          position: static;
          background: transparent;
          box-shadow: none;
        }
      }

      .emotion-2 {
        width: 100%;
        position: relative;
        z-index: 2;
      }

      .enskbpv4 .emotion-2 {
        position: relative;
        height: 125px;
      }

      @media only screen and (min-width: 500px) {
        .enskbpv4 .emotion-2 {
          height: 100%;
        }
      }

      @media only screen and (min-width: 500px) {
        .emotion-2 {
          display: inline-block;
          position: static;
          width: 300px;
          height: 120px;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }

        .emotion-1 .emotion-2 {
          z-index: 10;
          width: 100px;
          height: 100%;
          position: static;
          background: transparent;
          box-shadow: none;
        }
      }

      @media only screen and (min-width: 1200px) {
        .emotion-2 {
          display: block;
        }
      }

      <div>
        <div
          class="emotion-0 emotion-1"
          data-testid="fund-graph"
          role="button"
          tabindex="0"
        >
          <div
            class="emotion-2 emotion-3"
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
                  color="#333"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="0"
                  y="103.5"
                >
                  42.0p
                </text>
                <text
                  color="#333"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="0"
                  y="63.5"
                >
                  44.0p
                </text>
                <text
                  color="#333"
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

  describe.each`
    case                           | values
    ${'the values array is empty'} | ${[]}
    ${'there are no values'}       | ${null}
  `('when $case', ({ values }) => {
    it('should not render anything', () => {
      expect.assertions(1);
      expect(setup({ values }).container).toMatchInlineSnapshot(`<div />`);
    });
  });
});
