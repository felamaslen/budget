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
        color: #333;
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        font-weight: bold;
        margin-right: 0.25rem;
        text-align: right;
      }

      .c3 {
        display: -webkit-inline-box;
        display: -webkit-inline-flex;
        display: -ms-inline-flexbox;
        display: inline-flex;
        -webkit-flex: 2;
        -ms-flex: 2;
        flex: 2;
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
        text-overflow: unset;
        -webkit-flex: 0 0 50%;
        -ms-flex: 0 0 50%;
        flex: 0 0 50%;
        font-weight: bold;
        -webkit-flex-flow: column;
        -ms-flex-flow: column;
        flex-flow: column;
        max-width: 50%;
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
        text-overflow: unset;
        -webkit-flex: 0 0 50%;
        -ms-flex: 0 0 50%;
        flex: 0 0 50%;
      }

      .c5 {
        color: #483be4;
        text-align: right;
      }

      .c5::before {
        content: '\\2b08';
        font-style: normal;
        margin-right: 0.2em;
      }

      .c6 {
        color: #483be4;
        text-align: right;
        display: none;
        margin-right: 0.25rem;
      }

      .c8 {
        color: #ff2c2c;
        text-align: right;
      }

      .c8::before {
        content: '\\2198';
        font-style: normal;
        margin-right: 0.2em;
      }

      .c9 {
        color: #ff2c2c;
        text-align: right;
        display: none;
      }

      .c1 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        height: 100%;
        overflow: hidden;
        padding: 0;
      }

      .c0 {
        color: #483be4;
        width: 11.25rem;
      }

      @media only screen and (min-width:690px) {
        .c2 {
          width: 68px;
          text-align: left;
          -webkit-flex: 1 1 0;
          -ms-flex: 1 1 0;
          flex: 1 1 0;
          font-size: 1.125rem;
          margin-right: 0rem;
          overflow: visible !important;
        }
      }

      @media only screen and (min-width:690px) {
        .c3 {
          background: rgba(255,255,255,0.6);
          -webkit-flex: 2 1 0;
          -ms-flex: 2 1 0;
          flex: 2 1 0;
        }
      }

      @media only screen and (min-width:690px) {
        .c4 {
          max-width: initial;
        }
      }

      @media only screen and (min-width:690px) {
        .c7 {
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          padding-right: 0.5rem;
        }
      }

      @media only screen and (min-width:690px) {
        .c5 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      @media only screen and (min-width:690px) {
        .c6 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      @media only screen and (min-width:690px) {
        .c6 {
          display: block;
          margin-right: 0rem;
        }
      }

      @media only screen and (min-width:690px) {
        .c8 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      @media only screen and (min-width:690px) {
        .c8 {
          color: #ca6161;
        }
      }

      @media only screen and (min-width:690px) {
        .c9 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      @media only screen and (min-width:690px) {
        .c9 {
          color: #ca6161;
        }
      }

      @media only screen and (min-width:690px) {
        .c9 {
          display: block;
        }
      }

      @media only screen and (max-width:690px) {
        .c1 {
          background-color: transparent !important;
        }
      }

      @media only screen and (min-width:690px) {
        .c1 {
          background: #666;
          display: block;
        }

        .c1 > span {
          padding: 0 1px;
          text-overflow: ellipsis;
          text-align: center;
        }

        .sc-fznyAO .c1 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          margin-right: 0;
          padding: 0;
          width: 100%;
        }

        .sc-fznyAO .c1 > span {
          padding: 0;
        }
      }

      @media only screen and (min-width:350px) {
        .c0 {
          width: 13.5rem;
        }
      }

      @media only screen and (min-width:690px) {
        .c0 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex: 0 0 12.5rem;
          -ms-flex: 0 0 12.5rem;
          flex: 0 0 12.5rem;
          z-index: 1;
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
              class="sc-oTbqq c3"
            >
              <span
                class="sc-qYiqT c4"
              >
                <span
                  class="sc-oTmZL sc-pbIaG c5"
                >
                  £40
                </span>
                <span
                  class="sc-oTmZL c6"
                >
                  30.00%
                </span>
              </span>
              <span
                class="sc-qYiqT c7"
              >
                <span
                  class="sc-oTmZL sc-pbIaG c8"
                >
                  (£3)
                </span>
                <span
                  class="sc-oTmZL c9"
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
