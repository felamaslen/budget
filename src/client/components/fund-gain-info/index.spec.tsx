import { render, RenderResult } from '@testing-library/react';
import { rgb } from 'polished';
import React from 'react';
import { FundGainInfo } from '.';

describe('<FundGainInfo />', () => {
  const props = {
    rowGains: {
      price: 1023,
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
      @keyframes animation-0 {
        from {
          opacity: 0.8;
        }

        to {
          opacity: 0;
        }
      }

      .emotion-0 {
        color: #483be4;
        width: 11.25rem;
      }

      @media only screen and (min-width: 500px) {
        .emotion-0 {
          position: relative;
        }

        .emotion-0::after {
          -webkit-animation: animation-0 10000ms cubic-bezier(0.08, 0.89, 0.99, 0.71);
          animation: animation-0 10000ms cubic-bezier(0.08, 0.89, 0.99, 0.71);
          background: #483be4;
          content: '';
          display: none;
          height: 100%;
          opacity: 0;
          position: absolute;
          width: 100%;
        }
      }

      @media only screen and (min-width: 350px) {
        .emotion-0 {
          width: 13.5rem;
        }
      }

      @media only screen and (min-width: 500px) {
        .emotion-0 {
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

      .emotion-2 {
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        height: 100%;
        line-height: 100%;
        overflow: hidden;
        padding: 0;
      }

      @media only screen and (max-width: 500px) {
        .emotion-2 {
          background-color: transparent!important;
        }
      }

      @media only screen and (min-width: 500px) {
        .emotion-2 {
          background: #666;
          display: block;
        }

        .emotion-2>span {
          padding: 0 1px;
          text-overflow: ellipsis;
          text-align: center;
        }

        .ejr3omo15 .emotion-2 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          margin-right: 0;
          padding: 0;
          width: 100%;
        }

        .ejr3omo15 .emotion-2>span {
          padding: 0;
        }
      }

      .emotion-4 {
        color: #333;
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        font-weight: bold;
        margin-right: 0.25rem;
        text-align: right;
      }

      @media only screen and (min-width: 500px) {
        .emotion-4 {
          width: 68px;
          text-align: left;
          -webkit-flex: 1 1 0;
          -ms-flex: 1 1 0;
          flex: 1 1 0;
          font-size: 1.125rem;
          margin-right: 0rem;
          overflow: visible!important;
        }
      }

      .emotion-6 {
        display: -webkit-inline-box;
        display: -webkit-inline-flex;
        display: -ms-inline-flexbox;
        display: inline-flex;
        -webkit-flex: 2;
        -ms-flex: 2;
        flex: 2;
      }

      @media only screen and (min-width: 500px) {
        .emotion-6 {
          background: rgba(255,255,255,0.6);
          -webkit-flex: 2 1 0;
          -ms-flex: 2 1 0;
          flex: 2 1 0;
        }
      }

      .emotion-8 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        -webkit-box-flex-flow: column;
        -webkit-flex-flow: column;
        -ms-flex-flow: column;
        flex-flow: column;
        overflow: visible;
        text-overflow: unset;
        -webkit-flex: 0 0 50%;
        -ms-flex: 0 0 50%;
        flex: 0 0 50%;
        font-weight: bold;
        -webkit-box-flex-flow: column;
        -webkit-flex-flow: column;
        -ms-flex-flow: column;
        flex-flow: column;
        max-width: 50%;
      }

      @media only screen and (min-width: 500px) {
        .emotion-8 {
          max-width: 50%;
        }
      }

      .emotion-10 {
        color: #483be4;
        text-align: right;
      }

      @media only screen and (min-width: 500px) {
        .emotion-10 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      .emotion-10::before {
        content: '\\2b08';
        font-style: normal;
        margin-right: 0.2em;
      }

      .emotion-12 {
        color: #483be4;
        text-align: right;
        display: none;
        margin-right: 0.25rem;
      }

      @media only screen and (min-width: 500px) {
        .emotion-12 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      @media only screen and (min-width: 500px) {
        .emotion-12 {
          display: block;
          margin-right: 0rem;
        }
      }

      .emotion-14 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        -webkit-box-flex-flow: column;
        -webkit-flex-flow: column;
        -ms-flex-flow: column;
        flex-flow: column;
        overflow: visible;
        text-overflow: unset;
        -webkit-flex: 0 0 50%;
        -ms-flex: 0 0 50%;
        flex: 0 0 50%;
      }

      @media only screen and (min-width: 500px) {
        .emotion-14 {
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          padding-right: 0.5rem;
        }
      }

      .emotion-16 {
        color: #ff2c2c;
        text-align: right;
      }

      @media only screen and (min-width: 500px) {
        .emotion-16 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      .emotion-16::before {
        content: '\\2198';
        font-style: normal;
        margin-right: 0.2em;
      }

      @media only screen and (min-width: 500px) {
        .emotion-16 {
          color: #ca6161;
        }
      }

      .emotion-18 {
        color: #ff2c2c;
        text-align: right;
        display: none;
      }

      @media only screen and (min-width: 500px) {
        .emotion-18 {
          -webkit-flex: 1 0 0;
          -ms-flex: 1 0 0;
          flex: 1 0 0;
          font-size: 0.8125rem;
          line-height: 24px;
          height: 24px;
        }
      }

      @media only screen and (min-width: 500px) {
        .emotion-18 {
          color: #ca6161;
        }
      }

      @media only screen and (min-width: 500px) {
        .emotion-18 {
          display: block;
        }
      }

      <div>
        <div
          class="emotion-0 emotion-1"
        >
          <span
            class="emotion-2 emotion-3"
            style="background-color: rgb(255, 128, 30);"
          >
            <span
              class="emotion-4 emotion-5"
            >
              £5.6k
            </span>
            <span
              class="emotion-6 emotion-7"
            >
              <span
                class="emotion-8 emotion-9"
              >
                <span
                  class="emotion-10 emotion-11"
                >
                  £40
                </span>
                <span
                  class="emotion-12 emotion-13"
                >
                  30.00%
                </span>
              </span>
              <span
                class="emotion-14 emotion-15"
              >
                <span
                  class="emotion-16 emotion-17"
                >
                  (£3)
                </span>
                <span
                  class="emotion-18 emotion-19"
                >
                  (2.00%)
                </span>
              </span>
            </span>
          </span>
        </div>
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
