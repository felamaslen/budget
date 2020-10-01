/* eslint-disable max-len */
import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';

import { GraphSpending } from '.';
import { TodayContext } from '~client/hooks';
import { testState as state } from '~client/test-data/state';

describe('<GraphSpending />', () => {
  const makeStore = createStore();
  const today = endOfDay(new Date('2020-04-20T16:29Z'));

  const setup = (): RenderResult => {
    const store = makeStore(state);

    return render(
      <Provider store={store}>
        <TodayContext.Provider value={today}>
          <GraphSpending />
        </TodayContext.Provider>
      </Provider>,
    );
  };

  it('should render a graph', async () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    expect(getByTestId('graph-svg')).toMatchInlineSnapshot(`
      @media only screen and (min-width:500px) {

      }

      @media only screen and (min-width:500px) {

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
                y1="300.5"
                y2="300.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="235.5"
                y2="235.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="170.5"
                y2="170.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="105.5"
                y2="105.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="40.5"
                y2="40.5"
              />
            </g>
            <g>
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="287.5"
                y2="287.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="274.5"
                y2="274.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="261.5"
                y2="261.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="248.5"
                y2="248.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="222.5"
                y2="222.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="209.5"
                y2="209.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="196.5"
                y2="196.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="183.5"
                y2="183.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="157.5"
                y2="157.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="144.5"
                y2="144.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="131.5"
                y2="131.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="118.5"
                y2="118.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="92.5"
                y2="92.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="79.5"
                y2="79.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="66.5"
                y2="66.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="53.5"
                y2="53.5"
              />
            </g>
            <g>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="298.5"
              >
                −£10
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="233.5"
              >
                £0
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="168.5"
              >
                £10
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="103.5"
              >
                £20
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="38.5"
              >
                £30
              </text>
            </g>
            <g>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="298.5"
              >
                0.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="233.5"
              >
                50.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="168.5"
              >
                100.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="103.5"
              >
                150.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="38.5"
              >
                200.00%
              </text>
            </g>
            <g>
              <line
                stroke="#eaeaea"
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
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="11.5"
                x2="11.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="30.5"
                x2="30.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="49.5"
                x2="49.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
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
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="88.5"
                x2="88.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="107.5"
                x2="107.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="127.5"
                x2="127.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
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
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="165.5"
                x2="165.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="185.5"
                x2="185.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="204.5"
                x2="204.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="223.5"
                x2="223.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
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
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="262.5"
                x2="262.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="281.5"
                x2="281.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="301.5"
                x2="301.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
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
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="339.5"
                x2="339.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="359.5"
                x2="359.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="378.5"
                x2="378.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
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
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="417.5"
                x2="417.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="436.5"
                x2="436.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="455.5"
                x2="455.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
                stroke-width="0.5"
                x1="475.5"
                x2="475.5"
                y1="295"
                y2="0"
              />
              <line
                stroke="#eaeaea"
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
                stroke="#000"
                stroke-width="1"
                x1="-8.5"
                x2="-8.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#333"
                stroke-width="1"
                x1="0.5"
                x2="0.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="11.5"
                x2="11.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="30.5"
                x2="30.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="49.5"
                x2="49.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="69.5"
                x2="69.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#333"
                stroke-width="1"
                x1="77.5"
                x2="77.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="88.5"
                x2="88.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="107.5"
                x2="107.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="127.5"
                x2="127.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="146.5"
                x2="146.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#333"
                stroke-width="1"
                x1="162.5"
                x2="162.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="165.5"
                x2="165.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="185.5"
                x2="185.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="204.5"
                x2="204.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="223.5"
                x2="223.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="243.5"
                x2="243.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#333"
                stroke-width="1"
                x1="245.5"
                x2="245.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="262.5"
                x2="262.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="281.5"
                x2="281.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="301.5"
                x2="301.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="320.5"
                x2="320.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#333"
                stroke-width="1"
                x1="331.5"
                x2="331.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="339.5"
                x2="339.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="359.5"
                x2="359.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="378.5"
                x2="378.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="397.5"
                x2="397.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#333"
                stroke-width="1"
                x1="414.5"
                x2="414.5"
                y1="300"
                y2="285"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="417.5"
                x2="417.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="436.5"
                x2="436.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="455.5"
                x2="455.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="475.5"
                x2="475.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#000"
                stroke-width="1"
                x1="494.5"
                x2="494.5"
                y1="300"
                y2="295"
              />
              <line
                stroke="#333"
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
              stroke="#333"
              stroke-width="1"
              x1="2237.5"
              x2="2237.5"
              y1="300"
              y2="40"
            />
            <text
              color="#000"
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
              d="M0,235 L2.6573610894698413e-15,191.602  L-4.1,193.6 L0.0,187.6 L4.1,193.6 L0.0,191.6"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="0.74"
            />
          </g>
          <g>
            <path
              d="M77.34806629834254,235 L77.34806629834254,241.76080000000002  L81.1,239.9 L77.3,245.5 L73.6,239.9 L77.3,241.8"
              fill="#c30"
              stroke="#c30"
              stroke-width="0.504"
            />
          </g>
          <g>
            <path
              d="M162.98342541436463,235 L162.98342541436463,185.26930000000002  L158.7,187.4 L163.0,181.1 L167.2,187.4 L163.0,185.3"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="0.841"
            />
          </g>
          <g>
            <path
              d="M245.85635359116023,235 L245.85635359116023,126.8329  L240.2,129.6 L245.9,121.4 L251.5,129.6 L245.9,126.8"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="1.773"
            />
          </g>
          <g>
            <path
              d="M331.49171270718233,235 L331.49171270718233,93.78999999999999  L325.0,96.9 L331.5,87.6 L337.9,96.9 L331.5,93.8"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="2.3000000000000003"
            />
          </g>
          <g>
            <path
              d="M414.36464088397787,235 L414.36464088397787,125.14  L408.7,127.9 L414.4,119.6 L420.1,127.9 L414.4,125.1"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="1.7999999999999998"
            />
          </g>
          <g>
            <path
              d="M500,235 L500,74.97999999999999  L493.1,78.3 L500.0,68.3 L506.9,78.3 L500.0,75.0"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="2.6"
            />
          </g>
        </g>
        <g>
          <path
            d="M0,153.10000000000002 Q53,95 77.3,100.6 C110,108 127,174 163.0,192.2 C186,204 219,181 245.9,187.7 C278,196 300,226 331.5,235.0 C359,243 385,235 414.4,235.0 Q444,235 500.0,235.0"
            fill="none"
            stroke="#bf2424"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,251.9 Q52,304 77.3,300.0 C109,295 129,245 163.0,227.1 C188,213 218,217 245.9,207.8 C277,197 300,177 331.5,170.0 C359,164 385,170 414.4,170.0 Q444,170 500.0,170.0 L500,300 L0,300"
            fill="rgba(0,153,51,0.2)"
            stroke="none"
            stroke-width="1"
          />
          <path
            d="M0,251.9 Q50,275 77.3,275.9 C107,277 133,265 163.0,259.7 C192,255 217,252 245.9,246.7 C276,242 301,236 331.5,231.4 C360,227 385,224 414.4,221.1 Q444,218 500.0,213.8"
            fill="none"
            stroke="#999"
            stroke-dasharray="3,5"
            stroke-width="1"
          />
        </g>
        <g>
          <g>
            <rect
              fill="rgba(255,255,255,0.6)"
              height="60"
              width="200"
              x="45"
              y="8"
            />
            <text
              alignment-baseline="hanging"
              color="#000"
              font-family="Arial, Helvetica, sans-serif"
              font-size="16"
              x="65"
              y="10"
            >
              Cash flow
            </text>
            <line
              stroke="#bf2424"
              stroke-width="2"
              x1="50"
              x2="74"
              y1="40"
              y2="40"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="78"
              y="40"
            >
              Spending
            </text>
            <line
              stroke="#093"
              stroke-width="2"
              x1="50"
              x2="74"
              y1="58"
              y2="58"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="78"
              y="58"
            >
              Savings ratio
            </text>
            <rect
              fill="rgba(255,255,255,0.6)"
              height="260"
              width="-1737.5690607734805"
              x="2237.5690607734805"
              y="40"
            />
          </g>
        </g>
      </svg>
    `);
  });
});
