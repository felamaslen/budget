/* eslint-disable max-len */
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';
import sinon from 'sinon';

import { GraphBalance, Props } from '.';
import { testState as state } from '~client/test-data/state';

describe('<GraphBalance />', () => {
  let clock: sinon.SinonFakeTimers;
  const now = new Date('2020-04-20T16:29Z');
  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(() => {
    clock.restore();
  });

  const makeStore = createStore();

  const setup = (props: Props): RenderResult => {
    const store = makeStore({
      ...state,
      now,
    });

    return render(
      <Provider store={store}>
        <GraphBalance {...props} />
      </Provider>,
    );
  };

  it('should render a graph', async () => {
    expect.assertions(1);
    const { getByTestId } = setup({ isMobile: false });
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
                stroke="rgb(153,153,153)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="281.5"
                y2="281.5"
              />
              <line
                stroke="rgb(153,153,153)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="189.5"
                y2="189.5"
              />
              <line
                stroke="rgb(153,153,153)"
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
                y1="318.5"
                y2="318.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="299.5"
                y2="299.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="262.5"
                y2="262.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="244.5"
                y2="244.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="225.5"
                y2="225.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="207.5"
                y2="207.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="170.5"
                y2="170.5"
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
                y1="78.5"
                y2="78.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="59.5"
                y2="59.5"
              />
              <line
                stroke="rgb(238,238,238)"
                stroke-width="1"
                x1="0"
                x2="500"
                y1="41.5"
                y2="41.5"
              />
            </g>
            <g>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="279.5"
              >
                £0
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="187.5"
              >
                £5k
              </text>
              <text
                alignment-baseline="baseline"
                font-family="Arial, Helvetica, sans-serif"
                font-size="11"
                text-anchor="start"
                x="0"
                y="94.5"
              >
                £10k
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
                stroke="rgb(153,153,153)"
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
                stroke="rgb(153,153,153)"
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
                stroke="rgb(153,153,153)"
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
                stroke="rgb(153,153,153)"
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
                stroke="rgb(153,153,153)"
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
                stroke="rgb(153,153,153)"
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
                stroke="rgb(153,153,153)"
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
          <path
            d="M0,281.28500936581725 Q36,89 77.3,40.0 C93,21 144,61 163.0,87.8 C203,145 204,232 245.9,279.5 C263,299 302,279 331.5,279.5 C360,279 385,279 414.4,279.5 Q444,279 500.0,279.5"
            fill="none"
            stroke="#00348a"
            stroke-dasharray="3,5"
            stroke-width="1"
          />
        </g>
        <g>
          <path
            d="M0,281.28500936581725 Q36,90 77.3,41.8 C93,23 144,63 163.0,89.6 C203,147 204,234 245.9,281.3 C263,301 302,281 331.5,281.3 C360,281 385,281 414.4,281.3 Q444,281 500.0,281.3 L500.0,281.3 Q444,281 414.4,281.3 C385,281 360,281 331.5,281.3 C302,281 263,301 245.9,281.3 C204,234 203,147 163.0,89.6 C144,63 93,23 77.3,41.8 Q36,90 0.0,281.3"
            fill="rgba(47,123,211,0.5)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,281.28500936581725 Q36,90 77.3,41.8"
            fill="none"
            stroke-width="2"
          />
          <path
            d="M77.34806629834254,41.81575750259327 C93,23 144,63 163.0,89.6"
            fill="none"
            stroke-width="2"
          />
          <path
            d="M162.98342541436463,89.60369171578304 C203,147 204,234 245.9,281.3"
            fill="none"
            stroke-width="2"
          />
          <path
            d="M245.85635359116023,281.28500936581725 C263,301 302,281 331.5,281.3"
            fill="none"
            stroke-width="2"
          />
          <path
            d="M331.49171270718233,281.28500936581725 C360,281 385,281 414.4,281.3"
            fill="none"
            stroke-width="2"
          />
          <path
            d="M414.36464088397787,281.28500936581725 Q444,281 500.0,281.3"
            fill="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,281.28500936581725 Q50,281 77.3,281.3 C107,281 133,281 163.0,281.0 C192,281 217,278 245.9,280.9 C276,284 301,297 331.5,300.0 C360,303 385,300 414.4,300.0 Q444,300 500.0,300.0 L500.0,281.3 Q444,281 414.4,281.3 C385,281 360,285 331.5,281.3 C301,278 276,266 245.9,262.2 C217,259 192,262 163.0,262.3 C133,262 107,262 77.3,262.6 Q50,263 0.0,262.7"
            fill="rgba(145,194,129,0.4)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <path
            d="M0,262.6954506167432 Q50,263 77.3,262.6 C107,262 133,262 163.0,262.3 C192,262 217,259 245.9,262.2 C276,266 301,278 331.5,281.3 C360,285 385,281 414.4,281.3 Q444,281 500.0,281.3 L500,300 L0,300"
            fill="rgba(84,110,122,0.4)"
            stroke="none"
            stroke-width="2"
          />
        </g>
        <g>
          <g>
            <rect
              fill="rgba(255,255,255,0.5)"
              height="62"
              width="64"
              x="48"
              y="88"
            />
            <text
              alignment-baseline="hanging"
              fill="rgb(51,51,51)"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="92"
            >
              −£NaN (1y)
            </text>
            <text
              alignment-baseline="hanging"
              fill="rgb(51,51,51)"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="114"
            >
              −£NaN (3y)
            </text>
            <text
              alignment-baseline="hanging"
              fill="rgb(51,51,51)"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="50"
              y="136"
            >
              −£NaN (5y)
            </text>
            <g>
              <path
                d="M245.85635359116023,281.28500936581725 LNaN,NaN  LNaN,NaN LNaN,NaN LNaN,NaN LNaN,NaN"
                fill="none"
                stroke="rgb(51,51,51)"
                stroke-width="1"
              />
            </g>
            <g>
              <path
                d="M0,281.28500936581725 LNaN,NaN  LNaN,NaN LNaN,NaN LNaN,NaN LNaN,NaN"
                fill="none"
                stroke="rgb(51,51,51)"
                stroke-width="1"
              />
            </g>
            <g>
              <path
                d="M77.34806629834254,41.81575750259327 LNaN,NaN  LNaN,NaN LNaN,NaN LNaN,NaN LNaN,NaN"
                fill="none"
                stroke="rgb(51,51,51)"
                stroke-width="1"
              />
            </g>
          </g>
          <g>
            <rect
              fill="rgba(255,255,255,0.5)"
              height="80"
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
              Balance
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
              Pension
            </text>
            <line
              stroke="#00348a"
              stroke-dasharray="3,4"
              stroke-width="1"
              x1="50"
              x2="74"
              y1="72.5"
              y2="72.5"
            />
            <text
              alignment-baseline="middle"
              fill="#333"
              font-family="Arial, Helvetica, sans-serif"
              font-size="11"
              x="78"
              y="72"
            >
              Options
            </text>
          </g>
        </g>
      </svg>
    `);
  });
});
