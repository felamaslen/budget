import { render, RenderResult } from '@testing-library/react';
import { rgb } from 'polished';
import React from 'react';
import { FundGainInfo } from '.';

describe('<FundGainInfo />', () => {
  const props = {
    rowGains: {
      value: 561932,
      gain: 0.3,
      gainAbs: 4030,
      dayGain: -0.02,
      dayGainAbs: -341,
      color: rgb(255, 128, 30),
    },
    isSold: false,
  };

  const setup = (extraProps = {}): RenderResult =>
    render(<FundGainInfo {...props} {...extraProps} />);

  it.each`
    thing                        | value
    ${'current value'}           | ${'£5.6k'}
    ${'overall (absolute) gain'} | ${'£40'}
    ${'overall (relative) gain'} | ${'30.00%'}
    ${'daily (absolute) gain'}   | ${'(£3)'}
    ${'daily (relative) gain'}   | ${'(2.00%)'}
  `('should render the $thing', ({ value }) => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText(value)).toBeInTheDocument();
  });

  it('should match how it last rendered', () => {
    expect.assertions(1);
    const { container } = setup();
    expect(container).toMatchInlineSnapshot(`
      .c2 {
        width: 68px;
        text-align: left;
        -webkit-flex: 1 1 0;
        -ms-flex: 1 1 0;
        flex: 1 1 0;
        font-weight: bold;
        font-size: 1.125rem;
        color: #333;
        overflow: visible !important;
      }

      .c3 {
        display: -webkit-inline-box;
        display: -webkit-inline-flex;
        display: -ms-inline-flexbox;
        display: inline-flex;
        -webkit-flex: 2 1 0;
        -ms-flex: 2 1 0;
        flex: 2 1 0;
      }

      .c4 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        -webkit-flex-flow: column;
        -ms-flex-flow: column;
        flex-flow: column;
        overflow: visible;
        text-overflow: none;
        font-weight: bold;
        -webkit-flex-flow: column;
        -ms-flex-flow: column;
        flex-flow: column;
      }

      .c7 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        -webkit-flex-flow: column;
        -ms-flex-flow: column;
        flex-flow: column;
        overflow: visible;
        text-overflow: none;
      }

      .c5 {
        color: #483be4;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 0.8125rem;
        line-height: 24px;
        height: 24px;
        background: rgba(255,255,255,0.6);
      }

      .c5::before {
        content: '\\2b08';
        font-style: normal;
        margin-right: 0.2em;
      }

      .c6 {
        color: #483be4;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 0.8125rem;
        line-height: 24px;
        height: 24px;
        background: rgba(255,255,255,0.6);
      }

      .c8 {
        color: #ff2c2c;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 0.8125rem;
        line-height: 24px;
        height: 24px;
        background: rgba(255,255,255,0.6);
        color: #ca6161;
      }

      .c8::before {
        content: '\\2198';
        font-style: normal;
        margin-right: 0.2em;
      }

      .c9 {
        color: #ff2c2c;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 0.8125rem;
        line-height: 24px;
        height: 24px;
        background: rgba(255,255,255,0.6);
        color: #ca6161;
      }

      .c1 {
        padding: 0;
        height: 100%;
      }

      .c0 {
        -webkit-flex: 0 0 200px;
        -ms-flex: 0 0 200px;
        flex: 0 0 200px;
        z-index: 1;
        color: #483be4;
      }

      @media only screen and (min-width:690px) {
        .c1 {
          background: #666;
        }

        .c1 > span {
          float: left;
          padding: 0 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

        .sc-fzoLag .c1 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          margin-right: 0;
          padding: 0;
          width: 100%;
        }

        .sc-fzoLag .c1 > span {
          padding: 0;
        }
      }

      @media only screen and (min-width:690px) {
        .c0 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
        }
      }

      <div>
        <span
          class="c0"
        >
          <span
            class="c1"
            color="#ff801e"
            style="background-color: rgb(255, 128, 30);"
          >
            <span
              class="c2"
            >
              £5.6k
            </span>
            <span
              class="sc-AxgMl c3"
            >
              <span
                class="sc-pJurq c4"
              >
                <span
                  class="sc-pkhIR sc-psCJM c5"
                >
                  £40
                </span>
                <span
                  class="sc-pkhIR c6"
                >
                  30.00%
                </span>
              </span>
              <span
                class="sc-pJurq c7"
              >
                <span
                  class="sc-pkhIR sc-psCJM c8"
                >
                  (£3)
                </span>
                <span
                  class="sc-pkhIR c9"
                >
                  (2.00%)
                </span>
              </span>
            </span>
          </span>
        </span>
      </div>
    `);
  });

  it('should not render anything if there are no gain info', () => {
    expect.assertions(1);
    const { container } = setup({ rowGains: null });
    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  describe('if the fund is sold', () => {
    const setupSold = (): RenderResult => setup({ isSold: true });

    it('should not render the daily gains', () => {
      expect.assertions(2);
      const { queryByText } = setupSold();
      expect(queryByText('(£3)')).not.toBeInTheDocument();
      expect(queryByText('(£2.00%)')).not.toBeInTheDocument();
    });
  });
});
