import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import { DocumentNode } from 'graphql';
import React from 'react';
import { Client } from 'urql';
import { fromValue } from 'wonka';

import { GraphFundItem, Popout, Props } from '.';
import * as FundQueries from '~client/gql/queries/funds';

import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { FundHistoryIndividualQueryVariables } from '~client/types/gql';

describe('<GraphFundItem />', () => {
  const props: Props = {
    id: 123,
    item: 'My fund',
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
    stockSplits: [{ date: new Date('2022-11-02'), ratio: 3 }],
    sold: false,
  };

  const mockClient = ({
    executeQuery: ({
      variables,
      query,
    }: {
      variables: Record<string, unknown>;
      query: DocumentNode;
    }) => {
      if (
        query === FundQueries.FundHistoryIndividual &&
        (variables as FundHistoryIndividualQueryVariables).id === 123
      ) {
        return fromValue({
          data: {
            fundHistoryIndividual: {
              values: [
                { date: 1667239199, price: 806.22 * 3 },
                { date: 1667247661, price: 809.67 * 3 },
                { date: 1667301239, price: 765.18 * 3 },
                { date: 1667318912, price: 783.91 * 3 }, // 2022-11-01
                { date: 1667476991, price: 814.77 }, // 2022-11-03
                { date: 1667548872, price: 819.46 },
                { date: 1667615662, price: 817.42 },
                { date: 1667649184, price: 862.17 },
              ],
            },
          },
        });
      }
      return fromValue({ data: null });
    },
  } as unknown) as Client;

  const setup = (customProps: Partial<Props> = {}): RenderResult =>
    render(
      <GQLProviderMock client={mockClient}>
        <GraphFundItem {...props} {...customProps} />
      </GQLProviderMock>,
    );

  beforeAll(async () => {
    await Popout.load();
  });

  it('should render a graph', async () => {
    expect.hasAssertions();
    const { container } = setup();
    expect(container).toMatchInlineSnapshot(`
      .emotion-0 {
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
        position: relative;
      }

      @media only screen and (min-width: 500px) {
        .emotion-0 {
          height: 100%;
          -webkit-flex: 0 0 6.25rem;
          -ms-flex: 0 0 6.25rem;
          flex: 0 0 6.25rem;
          outline: none;
          z-index: 2;
        }

        .emotion-0:focus {
          box-shadow: inset 0 0 1px 1px #09e;
        }
      }

      .emotion-2 {
        width: 100%;
        position: relative;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
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
          width: 100px;
          height: 48px;
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
            height="48"
            width="100"
          >
            <svg
              data-testid="graph-svg"
              height="48"
              width="100"
            >
              <g>
                <path
                  d="M0,39.050847457627164 Q6,38 8.3,39.1"
                  fill="none"
                  stroke="#0c3"
                  stroke-width="1"
                />
                <path
                  d="M8.333333333333332,39.050847457627164 C12,41 14,48 16.7,48.0 C20,48 23,43 25.0,39.1"
                  fill="none"
                  stroke="#c30"
                  stroke-width="1"
                />
                <path
                  d="M25,39.050847457627164 C29,30 29,19 33.3,9.8 Q35,6 41.7,1.6"
                  fill="none"
                  stroke="#0c3"
                  stroke-width="1"
                />
              </g>
              <g>
                <path
                  d="M66.66666666666666,0 Q72,0 75.0,0.0"
                  fill="none"
                  stroke="#0c3"
                  stroke-width="1"
                />
                <path
                  d="M75,0 C78,0 82,-1 83.3,1.6 Q91,12 100.0,37.4"
                  fill="none"
                  stroke="#c30"
                  stroke-width="1"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    `);
  });

  describe('when focused', () => {
    it('should render a filled graph', async () => {
      expect.hasAssertions();
      const { container, getByRole } = setup();
      act(() => {
        fireEvent.focus(getByRole('button'));
      });
      expect(container).toMatchInlineSnapshot(`
        .emotion-0 {
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          -webkit-justify-content: center;
          justify-content: center;
          position: relative;
        }

        @media only screen and (min-width: 500px) {
          .emotion-0 {
            height: 100%;
            -webkit-flex: 0 0 6.25rem;
            -ms-flex: 0 0 6.25rem;
            flex: 0 0 6.25rem;
            outline: none;
            z-index: 3;
          }

          .emotion-0:focus {
            box-shadow: inset 0 0 1px 1px #09e;
          }
        }

        @media only screen and (min-width: 500px) {
          .css-b39tn7-Graph {
            display: inline-block;
            position: static;
            width: 100px;
            height: 48px;
            background: rgba(255,255,255,0.95);
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
          }

          .emotion-1 .css-b39tn7-Graph {
            z-index: 10;
            width: 100px;
            height: 100%;
            position: static;
            background: transparent;
            box-shadow: none;
          }
        }

        .emotion-2 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-align-self: flex-start;
          -ms-flex-item-align: flex-start;
          align-self: flex-start;
          background: rgba(255,255,255,0.8);
          font-size: 0.6875rem;
          height: 7.5rem;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          -webkit-justify-content: center;
          justify-content: center;
          left: 0;
          position: absolute;
          width: 18.75rem;
          z-index: 3;
        }

        .emotion-2>div {
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
        }

        .ejr3omo15:nth-last-of-type(-n + 3) .emotion-2 {
          top: initial;
          bottom: 0;
        }

        @media only screen and (min-width: 500px) {
          .emotion-2:focus svg {
            background: rgba(255,255,255,0.8);
            box-shadow: 0 3px 7px rgba(0,0,0,0.2);
          }
        }

        .emotion-4 {
          width: 100%;
          position: relative;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          z-index: 2;
        }

        .enskbpv4 .emotion-4 {
          position: relative;
          height: 125px;
        }

        @media only screen and (min-width: 500px) {
          .enskbpv4 .emotion-4 {
            height: 100%;
          }
        }

        @media only screen and (min-width: 500px) {
          .emotion-4 {
            display: inline-block;
            position: static;
            width: 300px;
            height: 120px;
            background: rgba(255,255,255,0.95);
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
          }

          .emotion-1 .emotion-4 {
            z-index: 10;
            width: 100px;
            height: 100%;
            position: static;
            background: transparent;
            box-shadow: none;
          }
        }

        @media only screen and (min-width: 1200px) {
          .emotion-4 {
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
            >
              <div
                class="emotion-4 emotion-5"
                height="120"
                width="300"
              >
                <svg
                  data-testid="graph-svg"
                  height="120"
                  width="300"
                >
                  <g>
                    <g>
                      <text
                        alignment-baseline="baseline"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        text-anchor="start"
                        x="0"
                        y="95.5"
                      >
                        764.0p
                      </text>
                      <text
                        alignment-baseline="baseline"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        text-anchor="start"
                        x="0"
                        y="75.5"
                      >
                        784.0p
                      </text>
                      <text
                        alignment-baseline="baseline"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        text-anchor="start"
                        x="0"
                        y="55.5"
                      >
                        804.0p
                      </text>
                      <text
                        alignment-baseline="baseline"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        text-anchor="start"
                        x="0"
                        y="35.5"
                      >
                        824.0p
                      </text>
                      <text
                        alignment-baseline="baseline"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        text-anchor="start"
                        x="0"
                        y="15.5"
                      >
                        844.0p
                      </text>
                      <text
                        alignment-baseline="baseline"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        text-anchor="start"
                        x="0"
                        y="-3.5"
                      >
                        864.0p
                      </text>
                    </g>
                    <g>
                      <text
                        alignment-baseline="middle"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        transform="rotate(-30 38.5 86)"
                        x="38.5"
                        y="120"
                      >
                        Tue
                      </text>
                      <text
                        alignment-baseline="middle"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        transform="rotate(-30 96.5 86)"
                        x="96.5"
                        y="120"
                      >
                        Wed
                      </text>
                      <text
                        alignment-baseline="middle"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        transform="rotate(-30 154.5 86)"
                        x="154.5"
                        y="120"
                      >
                        Thu
                      </text>
                      <text
                        alignment-baseline="middle"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        transform="rotate(-30 213.5 86)"
                        x="213.5"
                        y="120"
                      >
                        Fri
                      </text>
                      <text
                        alignment-baseline="middle"
                        font-family="Arial, Helvetica, sans-serif"
                        font-size="11"
                        transform="rotate(-30 271.5 86)"
                        x="271.5"
                        y="120"
                      >
                        Sat
                      </text>
                    </g>
                  </g>
                  <g>
                    <path
                      d="M24.0,55.4 L29.7,52.0 L47.7,55.4"
                      fill="none"
                      stroke="#0c3"
                      stroke-width="1"
                    />
                    <path
                      d="M47.7,55.4 L65.8,96.0 L77.7,77.5 L130.9,55.4"
                      fill="none"
                      stroke="#c30"
                      stroke-width="1"
                    />
                    <path
                      d="M130.9,55.4 L184.1,46.9 L232.5,42.3 L277.4,44.3 L300.0,0.0"
                      fill="none"
                      stroke="#0c3"
                      stroke-width="1"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      `);
    });
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
