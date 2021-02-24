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
                y1="213.5"
                y2="213.5"
              />
              <line
                stroke="#999"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="126.5"
                y2="126.5"
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
                y1="282.5"
                y2="282.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="265.5"
                y2="265.5"
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
                y1="230.5"
                y2="230.5"
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
                y1="178.5"
                y2="178.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="161.5"
                y2="161.5"
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
                y1="109.5"
                y2="109.5"
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
                y1="74.5"
                y2="74.5"
              />
              <line
                stroke="#eaeaea"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="57.5"
                y2="57.5"
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
                y="211.5"
              >
                £20k
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="124.5"
              >
                £40k
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="38.5"
              >
                £60k
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
            d="M0.0,179.8 L77.3,166.9 L163.0,152.7 L245.9,136.9 L331.5,119.4 L414.4,100.0 L500.0,78.5"
            fill="none"
            stroke="#999"
            stroke-width="1"
          />
        </g>
        <g>
          <path
            d="M0,227.17833333333334 Q51,212 77.3,202.2 C108,191 132,174 163.0,166.6 C191,160 217,163 245.9,161.3 C276,159 302,158 331.5,156.1 C360,154 385,153 414.4,150.8 Q444,149 500.0,145.5 L500,300 L0,300"
            fill="rgba(150,140,39,0.5)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,222.81124333333332 Q52,209 77.3,197.9 C109,184 131,157 163.0,149.3 C190,143 217,156 245.9,156.8 C276,157 302,153 331.5,151.5 C360,150 385,148 414.4,146.2 Q444,144 500.0,140.9 L500.0,145.5 Q444,149 414.4,150.8 C385,153 360,154 331.5,156.1 C302,158 276,159 245.9,161.3 C217,163 191,160 163.0,166.6 C132,174 108,191 77.3,202.2 Q51,212 0.0,227.2"
            fill="rgba(84,110,122,0.4)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0.0,212.5 L77.3,187.6 L163.0,151.9 L245.9,146.7 L331.5,141.4 L414.4,136.1 L500.0,130.9"
            fill="none"
            stroke="rgba(84,110,122,0.5)"
            stroke-dasharray="3,5"
            stroke-width="1"
          />
        </g>
        <g>
          <path
            d="M0,222.81124333333332 Q47,172 77.3,157.2 C104,145 133,145 163.0,144.1 C192,143 217,151 245.9,151.4 C276,152 302,148 331.5,145.9 C360,144 385,142 414.4,140.4 Q444,138 500.0,134.8 L500.0,140.9 Q444,144 414.4,146.2 C385,148 360,150 331.5,151.5 C302,153 276,157 245.9,156.8 C217,156 190,143 163.0,149.3 C131,157 109,184 77.3,197.9 Q52,209 0.0,222.8"
            fill="rgba(145,194,129,0.4)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,227.17833333333334 Q42,130 77.3,105.4 C99,91 133,113 163.0,116.4"
            fill="none"
            stroke="#039"
            stroke-width="2"
          />
          <path
            d="M162.98342541436463,116.37019000000001 C192,120 217,123 245.9,123.6 C276,124 302,120 331.5,118.0 C360,116 385,114 414.4,112.4 Q444,110 500.0,106.7"
            fill="none"
            stroke="#808080"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,227.17833333333334 Q42,129 77.3,104.9 C99,90 133,113 163.0,115.9 C192,119 217,123 245.9,123.1 C276,123 302,120 331.5,117.5 C360,116 385,114 414.4,111.9 Q444,110 500.0,106.3 L500.0,106.7 Q444,110 414.4,112.4 C385,114 360,116 331.5,118.0 C302,120 276,124 245.9,123.6 C217,123 192,120 163.0,116.4 C133,113 99,91 77.3,105.4 Q42,130 0.0,227.2"
            fill="rgba(47,123,211,0.5)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,227.17833333333334 Q41,128 77.3,103.4 C99,89 133,111 163.0,114.0 C192,117 217,121 245.9,121.2 C276,121 302,118 331.5,115.5 C360,114 385,112 414.4,109.8 Q444,108 500.0,104.0"
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
              £104k (1y)
            </text>
            <text
              alignment-baseline="hanging"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="114"
            >
              £1m (3y)
            </text>
            <text
              alignment-baseline="hanging"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="136"
            >
              £14m (5y)
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
