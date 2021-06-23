/* eslint-disable max-len */
import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import React from 'react';

import { GraphSpending, Props } from '.';
import { ResizeContext, TodayContext } from '~client/hooks';
import { getOverviewGraphValues } from '~client/selectors';
import { testNow, testState as state } from '~client/test-data/state';

describe('<GraphSpending />', () => {
  const today = endOfDay(testNow);

  const setup = (): RenderResult => {
    const graph = getOverviewGraphValues(today, 0)(state);
    const props: Props = {
      isMobile: false,
      showAll: false,
      setShowAll: jest.fn(),
      longTerm: false,
      investments: Array(graph.values.income.length).fill(0),
      graph,
      initialCumulativeValues: { spending: 0, income: 0 },
      setMobileGraph: jest.fn(),
    };

    return render(
      <TodayContext.Provider value={today}>
        <ResizeContext.Provider value={1032}>
          <GraphSpending {...props} />
        </ResizeContext.Provider>
      </TodayContext.Provider>,
    );
  };

  it('should render a graph', async () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    expect(getByTestId('graph-svg')).toMatchInlineSnapshot(`
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
                £0
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="233.5"
              >
                £5
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
                £15
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="38.5"
              >
                £20
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
                25.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="168.5"
              >
                50.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="103.5"
              >
                75.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="38.5"
              >
                100.00%
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
              x1="113.5"
              x2="113.5"
              y1="300"
              y2="40"
            />
            <text
              color="#000"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="113.5"
              y="40"
            >
              Now
            </text>
          </g>
        </g>
        <g>
          <path
            d="M0,136.2 Q49,87 77.3,83.7 C106,81 132,109 163.0,118.0 C191,126 221,118 245.9,131.5 C280,150 298,188 331.5,208.2 C357,223 385,224 414.4,233.1 Q444,243 500.0,261.3"
            fill="none"
            stroke="#bf2424"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,300 Q50,300 77.3,300.0 C107,300 133,300 163.0,300.0 C192,300 217,300 245.9,300.0 C276,300 302,300 331.5,300.0 C360,300 385,300 414.4,300.0 Q444,300 500.0,300.0"
            fill="none"
            stroke="#546e7a"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,203.8 Q48,247 77.3,251.9 C105,257 133,237 163.0,231.7 C192,226 217,227 245.9,220.3 C276,213 301,202 331.5,193.5 C360,186 385,181 414.4,175.5 Q444,170 500.0,162.7"
            fill="none"
            stroke="#093"
            stroke-width="2"
          />
        </g>
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
            Spending (quarterly avg.)
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
            Savings ratio (yearly avg.)
          </text>
          <line
            stroke="#546e7a"
            stroke-width="2"
            x1="50"
            x2="74"
            y1="76"
            y2="76"
          />
          <text
            alignment-baseline="middle"
            fill="#333"
            font-family="Arial, Helvetica, sans-serif"
            font-size="11"
            x="78"
            y="76"
          >
            Investment ratio
          </text>
        </g>
      </svg>
    `);
  });
});
