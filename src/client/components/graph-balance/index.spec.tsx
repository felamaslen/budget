/* eslint-disable max-len */
import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';
import React from 'react';

import { GraphBalance, Props } from '.';
import { ResizeContext, TodayContext } from '~client/hooks';
import { getFutureMonths, getProcessedMonthlyValues, getStartDate } from '~client/selectors';
import { testNow, testState as state } from '~client/test-data/state';

describe('<GraphBalance />', () => {
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    let randomIndex = 0;
    randomSpy = jest.spyOn(Math, 'random').mockImplementation((): number => {
      randomIndex += 1;
      return randomIndex % 2 === 0 ? 0.32 : 0.81;
    });
  });
  afterEach(() => {
    jest.useRealTimers();
    randomSpy.mockRestore();
  });

  const today = endOfDay(testNow);

  const setup = (): RenderResult => {
    const processedMonthly = getProcessedMonthlyValues(today, 0)(state);
    const props: Props = {
      isMobile: false,
      showAll: false,
      setShowAll: jest.fn(),
      isLoading: false,
      startDate: getStartDate(state),
      futureMonths: getFutureMonths(today)(state),
      monthly: {
        ...processedMonthly.values,
        startPredictionIndex: processedMonthly.startPredictionIndex,
      },
    };

    return render(
      <TodayContext.Provider value={today}>
        <ResizeContext.Provider value={894}>
          <GraphBalance {...props} />
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
                £20k
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="168.5"
              >
                £40k
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="103.5"
              >
                £60k
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="38.5"
              >
                £80k
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
            d="M0.0,207.2 L77.3,194.7 L163.0,180.5 L245.9,164.4 L331.5,146.2 L414.4,125.5 L500.0,101.9"
            fill="none"
            stroke="#999"
            stroke-width="1"
          />
        </g>
        <g>
          <path
            d="M0,245.38375 Q50,230 77.3,226.7 C107,223 133,224 163.0,222.8 C192,221 217,220 245.9,218.9 C276,218 302,216 331.5,215.0 C360,214 385,212 414.4,211.1 Q444,210 500.0,207.1 L500,300 L0,300"
            fill="rgba(150,140,39,0.5)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,242.1084325 Q50,229 77.3,223.4 C107,217 133,211 163.0,209.8 C192,208 217,215 245.9,215.5 C276,216 302,213 331.5,211.6 C360,210 385,209 414.4,207.6 Q444,206 500.0,203.6 L500.0,207.1 Q444,210 414.4,211.1 C385,212 360,214 331.5,215.0 C302,216 276,218 245.9,218.9 C217,220 192,221 163.0,222.8 C133,224 107,223 77.3,226.7 Q50,230 0.0,245.4"
            fill="rgba(84,110,122,0.4)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0.0,234.4 L77.3,215.7 L163.0,211.8 L245.9,207.9 L331.5,204.0 L414.4,200.1 L500.0,196.1"
            fill="none"
            stroke="rgba(84,110,122,0.5)"
            stroke-dasharray="3,5"
            stroke-width="1"
          />
        </g>
        <g>
          <path
            d="M0,242.1084325 Q48,204 77.3,192.9 C105,182 133,181 163.0,179.4 C192,178 217,185 245.9,185.1 C276,185 302,183 331.5,181.1 C360,180 385,179 414.4,177.2 Q444,176 500.0,173.2 L500.0,203.6 Q444,206 414.4,207.6 C385,209 360,210 331.5,211.6 C302,213 276,216 245.9,215.5 C217,215 192,208 163.0,209.8 C133,211 107,217 77.3,223.4 Q50,229 0.0,242.1"
            fill="rgba(145,194,129,0.4)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,245.38375 Q44,175 77.3,154.0"
            fill="none"
            stroke="#039"
            stroke-width="2"
          />
          <path
            d="M77.34806629834254,154.03781999999998 C101,139 133,142 163.0,140.5 C192,139 217,146 245.9,146.1 C276,146 302,144 331.5,142.1 C360,141 385,139 414.4,138.1 Q444,137 500.0,134.0"
            fill="none"
            stroke="#808080"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,245.38375 Q44,175 77.3,153.7 C101,138 133,142 163.0,140.1 C192,139 217,145 245.9,145.8 C276,146 302,143 331.5,141.7 C360,140 385,139 414.4,137.7 Q444,136 500.0,133.7 L500.0,134.0 Q444,137 414.4,138.1 C385,139 360,141 331.5,142.1 C302,144 276,146 245.9,146.1 C217,146 192,139 163.0,140.5 C133,142 101,139 77.3,154.0 Q44,175 0.0,245.4"
            fill="rgba(47,123,211,0.5)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,245.38375 Q44,174 77.3,152.6 C101,137 133,140 163.0,139.0 C192,138 217,144 245.9,144.6 C276,145 302,142 331.5,140.6 C360,139 385,138 414.4,136.6 Q444,135 500.0,132.5"
            fill="none"
            stroke="#5aa8be"
            stroke-dasharray="3,5"
            stroke-width="1"
          />
        </g>
        <g>
          <g>
            <rect
              fill="rgba(255,255,255,0.6)"
              height="62"
              width="64"
              x="48"
              y="88"
            />
            <text
              alignment-baseline="hanging"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="92"
            >
              £148k (1y)
            </text>
            <text
              alignment-baseline="hanging"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="114"
            >
              £3m (3y)
            </text>
            <text
              alignment-baseline="hanging"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="136"
            >
              £64m (5y)
            </text>
          </g>
          <g>
            <rect
              fill="rgba(255,255,255,0.6)"
              height="80"
              width="250"
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
              Net worth
            </text>
            <line
              stroke="#039"
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
              Actual
            </text>
            <line
              stroke="#808080"
              stroke-width="2"
              x1="130"
              x2="154"
              y1="40"
              y2="40"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="158"
              y="40"
            >
              Predicted
            </text>
            <rect
              fill="rgba(150,140,39,0.5)"
              height="6"
              width="24"
              x="130"
              y="69"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="158"
              y="72"
            >
              Home equity
            </text>
            <rect
              fill="rgba(84,110,122,0.5)"
              height="6"
              width="24"
              x="50"
              y="53"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="78"
              y="56"
            >
              Stocks
            </text>
            <rect
              fill="#91c281"
              height="6"
              width="24"
              x="130"
              y="53"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="158"
              y="56"
            >
              Locked cash
            </text>
            <rect
              fill="rgba(47,123,211,0.5)"
              height="6"
              width="24"
              x="50"
              y="69"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="78"
              y="72"
            >
              Pension
            </text>
            <line
              stroke="#5aa8be"
              stroke-dasharray="3,4"
              stroke-width="2"
              x1="220"
              x2="244"
              y1="40.5"
              y2="40.5"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="248"
              y="40"
            >
              Options
            </text>
          </g>
        </g>
      </svg>
    `);
  });
});
