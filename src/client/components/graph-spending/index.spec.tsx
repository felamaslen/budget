/* eslint-disable max-len */
import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import React from 'react';

import { GraphSpending, Props } from '.';
import { ResizeContext, TodayContext } from '~client/hooks';
import { getFutureMonths, getProcessedMonthlyValues, getStartDate } from '~client/selectors';
import { testNow, testState as state } from '~client/test-data/state';

describe('<GraphSpending />', () => {
  const today = endOfDay(testNow);

  const setup = (): RenderResult => {
    const props: Props = {
      showAll: false,
      startDate: getStartDate(state),
      futureMonths: getFutureMonths(today)(state),
      monthly: getProcessedMonthlyValues(today)(state),
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
                y1="308.5"
                y2="308.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="222.5"
                y2="222.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="135.5"
                y2="135.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="48.5"
                y2="48.5"
              />
            </g>
            <g>
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="291.5"
                y2="291.5"
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
                y1="256.5"
                y2="256.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="239.5"
                y2="239.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="204.5"
                y2="204.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="187.5"
                y2="187.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="170.5"
                y2="170.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="152.5"
                y2="152.5"
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
                y1="100.5"
                y2="100.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="83.5"
                y2="83.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="66.5"
                y2="66.5"
              />
            </g>
            <g>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="306.5"
              >
                −£6
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="220.5"
              >
                £4
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="133.5"
              >
                £14
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="46.5"
              >
                £24
              </text>
            </g>
            <g>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="306.5"
              >
                −3.33%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="220.5"
              >
                30.00%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="133.5"
              >
                63.33%
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="end"
                x="500"
                y="46.5"
              >
                96.67%
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
          <g>
            <path
              d="M0,256.6666666666667 L3.618276118264817e-15,197.57573333333335  L-4.3,199.7 L0.0,193.3 L4.3,199.7 L0.0,197.6"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="0.8879999999999999"
            />
          </g>
          <g>
            <path
              d="M77.34806629834254,256.6666666666667 L77.34806629834254,265.9082666666667  L81.9,263.7 L77.3,270.3 L72.8,263.7 L77.3,265.9"
              fill="#c30"
              stroke="#c30"
              stroke-width="1.008"
            />
          </g>
          <g>
            <path
              d="M162.98342541436463,256.6666666666667 L162.98342541436463,207.05718666666667  L158.9,209.1 L163.0,203.0 L167.1,209.1 L163.0,207.1"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="0.7524000000000001"
            />
          </g>
          <g>
            <path
              d="M245.85635359116023,256.6666666666667 L245.85635359116023,129.44351999999998  L240.1,132.2 L245.9,123.8 L251.6,132.2 L245.9,129.4"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="1.8624"
            />
          </g>
          <g>
            <path
              d="M331.49171270718233,256.6666666666667 L331.49171270718233,91.68552  L324.9,94.9 L331.5,85.3 L338.1,94.9 L331.5,91.7"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="2.4024"
            />
          </g>
          <g>
            <path
              d="M414.36464088397787,256.6666666666667 L414.36464088397787,133.63885333333334  L408.7,136.4 L414.4,128.1 L420.1,136.4 L414.4,133.6"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="1.8024"
            />
          </g>
          <g>
            <path
              d="M500,256.6666666666667 L500,66.51352  L492.9,69.9 L500.0,59.6 L507.1,69.9 L500.0,66.5"
              fill="#0c3"
              stroke="#0c3"
              stroke-width="2.7624"
            />
          </g>
        </g>
        <g>
          <path
            d="M0,147.46666666666667 Q49,115 77.3,112.5 C106,110 133,130 163.0,135.3 C192,141 219,135 245.9,144.3 C278,156 300,183 331.5,195.5 C359,206 385,206 414.4,212.1 Q444,218 500.0,230.8"
            fill="none"
            stroke="#bf2424"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,203.8 Q48,247 77.3,251.9 C105,257 133,239 163.0,231.7 C192,224 217,217 245.9,208.4 C276,199 301,189 331.5,181.5 C360,174 385,170 414.4,165.1 Q444,160 500.0,151.5"
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
          <rect
            fill="rgba(255,255,255,0.6)"
            height="260"
            width="386.7403314917127"
            x="113.25966850828729"
            y="40"
          />
        </g>
      </svg>
    `);
  });
});
