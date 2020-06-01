/* eslint-disable max-len */
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';
import sinon from 'sinon';

import { GraphSpending } from '.';
import { testState as state } from '~client/test-data/state';

describe('<GraphSpending />', () => {
  const makeStore = createStore();
  const now = new Date('2020-04-20T16:29Z');

  const setup = (): RenderResult => {
    const store = makeStore(state);

    return render(
      <Provider store={store}>
        <GraphSpending />
      </Provider>,
    );
  };

  it('should render a graph', async () => {
    expect.assertions(1);
    const clock = sinon.useFakeTimers(now);
    const { getByTestId } = setup();
    expect(getByTestId('graph-svg')).toMatchInlineSnapshot(`
      @media only screen and (min-width:690px) {

      }

      @media only screen and (min-width:690px) {

      }

      @media only screen and (min-width:1200px) {

      }

      <svg
        data-testid="graph-svg"
        height="300"
        width="500"
      >
        <g>
          <g>
            <g>
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="284.5"
                y2="284.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="190.5"
                y2="190.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="96.5"
                y2="96.5"
              />
            </g>
            <g>
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="303.5"
                y2="303.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="265.5"
                y2="265.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="246.5"
                y2="246.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="227.5"
                y2="227.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="209.5"
                y2="209.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="171.5"
                y2="171.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="152.5"
                y2="152.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="133.5"
                y2="133.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="115.5"
                y2="115.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="77.5"
                y2="77.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="58.5"
                y2="58.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="40.5"
                y2="40.5"
              />
            </g>
            <g>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="282.5"
              >
                £0
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="188.5"
              >
                £10
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="94.5"
              >
                £20
              </text>
            </g>
            <g>
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="-8.5"
                x2="-8.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#999"
                stroke-width="0.5"
                x1="0.5"
                x2="0.5"
                y1="285"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="11.5"
                x2="11.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="30.5"
                x2="30.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="49.5"
                x2="49.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="69.5"
                x2="69.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#999"
                stroke-width="0.5"
                x1="77.5"
                x2="77.5"
                y1="285"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="88.5"
                x2="88.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="107.5"
                x2="107.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="127.5"
                x2="127.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="146.5"
                x2="146.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#999"
                stroke-width="0.5"
                x1="162.5"
                x2="162.5"
                y1="285"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="165.5"
                x2="165.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="185.5"
                x2="185.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="204.5"
                x2="204.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="223.5"
                x2="223.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="243.5"
                x2="243.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#999"
                stroke-width="0.5"
                x1="245.5"
                x2="245.5"
                y1="285"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="262.5"
                x2="262.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="281.5"
                x2="281.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="301.5"
                x2="301.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="320.5"
                x2="320.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#999"
                stroke-width="0.5"
                x1="331.5"
                x2="331.5"
                y1="285"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="339.5"
                x2="339.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="359.5"
                x2="359.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="378.5"
                x2="378.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="397.5"
                x2="397.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#999"
                stroke-width="0.5"
                x1="414.5"
                x2="414.5"
                y1="285"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="417.5"
                x2="417.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="436.5"
                x2="436.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="455.5"
                x2="455.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="475.5"
                x2="475.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="0.5"
                x1="494.5"
                x2="494.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#999"
                stroke-width="0.5"
                x1="500.5"
                x2="500.5"
                y1="285"
                y2="0"
              />
            </g>
            <g>
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="-8.5"
                x2="-8.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(51,51,51)"
                stroke-width="1"
                x1="0.5"
                x2="0.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="11.5"
                x2="11.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="30.5"
                x2="30.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="49.5"
                x2="49.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="69.5"
                x2="69.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(51,51,51)"
                stroke-width="1"
                x1="77.5"
                x2="77.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="88.5"
                x2="88.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="107.5"
                x2="107.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="127.5"
                x2="127.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="146.5"
                x2="146.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(51,51,51)"
                stroke-width="1"
                x1="162.5"
                x2="162.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="165.5"
                x2="165.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="185.5"
                x2="185.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="204.5"
                x2="204.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="223.5"
                x2="223.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="243.5"
                x2="243.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(51,51,51)"
                stroke-width="1"
                x1="245.5"
                x2="245.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="262.5"
                x2="262.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="281.5"
                x2="281.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="301.5"
                x2="301.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="320.5"
                x2="320.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(51,51,51)"
                stroke-width="1"
                x1="331.5"
                x2="331.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="339.5"
                x2="339.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="359.5"
                x2="359.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="378.5"
                x2="378.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="397.5"
                x2="397.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(51,51,51)"
                stroke-width="1"
                x1="414.5"
                x2="414.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="417.5"
                x2="417.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="436.5"
                x2="436.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="455.5"
                x2="455.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="475.5"
                x2="475.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(0,0,0)"
                stroke-width="1"
                x1="494.5"
                x2="494.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="rgb(51,51,51)"
                stroke-width="1"
                x1="500.5"
                x2="500.5"
                y1="300"
                y2="285"
              />
            </g>
            <g>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                transform="rotate(-30 0.5 285)"
                x="0.5"
                y="285"
              >
                Feb
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                transform="rotate(-30 77.5 285)"
                x="77.5"
                y="285"
              >
                Mar
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                transform="rotate(-30 162.5 285)"
                x="162.5"
                y="285"
              >
                Apr
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                transform="rotate(-30 245.5 285)"
                x="245.5"
                y="285"
              >
                May
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                transform="rotate(-30 331.5 285)"
                x="331.5"
                y="285"
              >
                Jun
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                transform="rotate(-30 414.5 285)"
                x="414.5"
                y="285"
              >
                Jul
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                transform="rotate(-30 500.5 285)"
                x="500.5"
                y="285"
              >
                Aug
              </text>
            </g>
          </g>
          <g>
            <line
              stroke="rgb(51,51,51)"
              stroke-width="1"
              x1="2237.5"
              x2="2237.5"
              y1="300"
              y2="40"
            />
            <text
              color="rgb(0,0,0)"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="2237.5"
              y="40"
            >
              Now
            </text>
          </g>
        </g>
        <g>
          <g>
            <path
              d="M0,284.21965317919074 L3.952230628091076e-15,219.67482881280569  L-4.3,221.8 L0.0,215.5 L4.3,221.8 L0.0,219.7"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="0.8538461538461538"
            />
          </g>
          <g>
            <path
              d="M77.34806629834254,284.21965317919074 L77.34806629834254,290.1  L84.8,286.5 L77.3,297.3 L69.8,286.5 L77.3,290.1"
              fill="#c30"
              stroke="#c30"
              stroke-width="3"
            />
          </g>
          <g>
            <path
              d="M162.98342541436463,284.21965317919074 L162.98342541436463,210.45587305469098  L158.5,212.6 L163.0,206.1 L167.4,212.6 L163.0,210.5"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="0.9703846153846154"
            />
          </g>
          <g>
            <path
              d="M245.85635359116023,284.21965317919074 L245.85635359116023,125.3859050689195  L239.8,128.3 L245.9,119.5 L251.9,128.3 L245.9,125.4"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="2.045769230769231"
            />
          </g>
          <g>
            <path
              d="M331.49171270718233,284.21965317919074 L331.49171270718233,77.28303690529125  L324.5,80.6 L331.5,70.6 L338.5,80.6 L331.5,77.3"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="2.6538461538461537"
            />
          </g>
          <g>
            <path
              d="M414.36464088397787,284.21965317919074 L414.36464088397787,122.92143174744331  L408.2,125.9 L414.4,117.0 L420.5,125.9 L414.4,122.9"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="2.0769230769230766"
            />
          </g>
          <g>
            <path
              d="M500,284.21965317919074 L500,49.900000000000006  L492.5,53.5 L500.0,42.7 L507.5,53.5 L500.0,49.9"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="3"
            />
          </g>
        </g>
        <g>
          <path
            d="M0,165.8670520231214 Q54,82 77.3,90.0 C111,102 124,193 163.0,222.3 C183,238 220,207 245.9,215.9 C279,228 298,271 331.5,284.2 C357,295 385,284 414.4,284.2 Q444,284 500.0,284.2"
            fill="none"
            stroke="#039"
            stroke-width="2"
          />
          <path
            d="M0,165.8670520231214 Q50,129 77.3,127.9 C107,127 132,151 163.0,159.4 C191,167 217,167 245.9,173.5 C276,180 301,189 331.5,195.7 C360,202 386,205 414.4,210.4 Q444,217 500.0,230.1"
            fill="none"
            stroke="#999"
            stroke-dasharray="3,5"
            stroke-width="1"
          />
        </g>
        <g>
          <g>
            <rect
              fill="rgba(255,255,255,0.5)"
              height="60"
              width="200"
              x="45"
              y="8"
            />
            <text
              alignment-baseline="hanging"
              color="rgb(0,0,0)"
              font-family="Arial, Helvetica, sans-serif"
              font-size="16"
              x="65"
              y="10"
            >
              Cash flow
            </text>
            <line
              stroke="rgb(0,51,153)"
              stroke-width="2"
              x1="50"
              x2="74"
              y1="40"
              y2="40"
            />
            <text
              alignment-baseline="middle"
              fill="rgb(51,51,51)"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="78"
              y="40"
            >
              Spending
            </text>
            <rect
              fill="rgba(255,255,255,0.5)"
              height="260"
              width="-1737.5690607734805"
              x="2237.5690607734805"
              y="40"
            />
          </g>
        </g>
      </svg>
    `);

    clock.restore();
  });
});