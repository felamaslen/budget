import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { AppLogo } from '.';

describe('<AppLogo />', () => {
  const props = {
    loading: false,
  };

  const setup = (customProps = {}): RenderResult => render(<AppLogo {...props} {...customProps} />);

  it('should render a logo', () => {
    expect.assertions(1);
    const { container } = setup();
    expect(container).toMatchInlineSnapshot(`
      .emotion-0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 0 0 2rem;
        -ms-flex: 0 0 2rem;
        flex: 0 0 2rem;
        -webkit-box-flex-flow: row-reverse;
        -webkit-flex-flow: row-reverse;
        -ms-flex-flow: row-reverse;
        flex-flow: row-reverse;
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: end;
        -ms-flex-pack: end;
        -webkit-justify-content: flex-end;
        justify-content: flex-end;
        padding: 0 0.5rem;
        width: 100%;
        background: #9f3030;
      }

      @media only screen and (min-width: 500px) {
        .emotion-0 {
          -webkit-flex: 0 0 auto;
          -ms-flex: 0 0 auto;
          flex: 0 0 auto;
          -webkit-box-flex-flow: row;
          -webkit-flex-flow: row;
          -ms-flex-flow: row;
          flex-flow: row;
          width: auto;
          height: 3.0625rem;
          background: none;
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
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        -webkit-box-flex-flow: row;
        -webkit-flex-flow: row;
        -ms-flex-flow: row;
        flex-flow: row;
        height: 100%;
        line-height: 100%;
        font-weight: bold;
        position: relative;
      }

      .emotion-2::before {
        background-image: url(path/to/test/file);
        -webkit-background-position: -1px -59px;
        background-position: -1px -59px;
        content: '';
        display: inline-block;
        -webkit-flex: 0 0 1.75rem;
        -ms-flex: 0 0 1.75rem;
        flex: 0 0 1.75rem;
        height: 1.75rem;
        margin-right: 0.5rem;
        width: 1.75rem;
      }

      @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .emotion-2::before {
          background-image: url(path/to/test/file);
          -webkit-background-size: 262px 88px;
          background-size: 262px 88px;
        }
      }

      .emotion-4 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        height: 100%;
        padding-right: 2.25rem;
      }

      .emotion-6 {
        font-size: 1.375rem;
        margin: 0;
      }

      @media only screen and (min-width: 500px) {
        .emotion-6 {
          -webkit-flex: 0 0 2.6875rem;
          -ms-flex: 0 0 2.6875rem;
          flex: 0 0 2.6875rem;
          line-height: 2.6875rem;
        }
      }

      <div>
        <div
          class="emotion-0 emotion-1"
        >
          <a
            class="emotion-2 emotion-3"
          >
            <div
              class="emotion-4 emotion-5"
            >
              <h1
                class="emotion-6 emotion-7"
              >
                Budget
              </h1>
            </div>
          </a>
        </div>
      </div>
    `);
  });

  it('should render the app title', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('Budget')).toBeInTheDocument();
  });

  describe('if loading a request', () => {
    const propsLoading = {
      ...props,
      loading: true,
    };

    it('should display a loading spinner', () => {
      expect.assertions(1);
      const { container } = setup(propsLoading);
      expect(container).toMatchInlineSnapshot(`
        @keyframes animation-0 {
          100% {
            -webkit-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }

        @keyframes animation-1 {
          0%, 100% {
            -webkit-transform: scale(0);
            -ms-transform: scale(0);
            transform: scale(0);
          }

          50% {
            -webkit-transform: scale(1.0);
            -ms-transform: scale(1.0);
            transform: scale(1.0);
          }
        }

        @keyframes animation-1 {
          0%, 100% {
            -webkit-transform: scale(0);
            -ms-transform: scale(0);
            transform: scale(0);
          }

          50% {
            -webkit-transform: scale(1.0);
            -ms-transform: scale(1.0);
            transform: scale(1.0);
          }
        }

        .emotion-0 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex: 0 0 2rem;
          -ms-flex: 0 0 2rem;
          flex: 0 0 2rem;
          -webkit-box-flex-flow: row-reverse;
          -webkit-flex-flow: row-reverse;
          -ms-flex-flow: row-reverse;
          flex-flow: row-reverse;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-pack: end;
          -ms-flex-pack: end;
          -webkit-justify-content: flex-end;
          justify-content: flex-end;
          padding: 0 0.5rem;
          width: 100%;
          background: #9f3030;
        }

        @media only screen and (min-width: 500px) {
          .emotion-0 {
            -webkit-flex: 0 0 auto;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            -webkit-box-flex-flow: row;
            -webkit-flex-flow: row;
            -ms-flex-flow: row;
            flex-flow: row;
            width: auto;
            height: 3.0625rem;
            background: none;
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
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          -webkit-box-flex-flow: row;
          -webkit-flex-flow: row;
          -ms-flex-flow: row;
          flex-flow: row;
          height: 100%;
          line-height: 100%;
          font-weight: bold;
          position: relative;
        }

        .emotion-2::before {
          background-image: url(path/to/test/file);
          -webkit-background-position: -1px -59px;
          background-position: -1px -59px;
          content: '';
          display: inline-block;
          -webkit-flex: 0 0 1.75rem;
          -ms-flex: 0 0 1.75rem;
          flex: 0 0 1.75rem;
          height: 1.75rem;
          margin-right: 0.5rem;
          width: 1.75rem;
        }

        @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .emotion-2::before {
            background-image: url(path/to/test/file);
            -webkit-background-size: 262px 88px;
            background-size: 262px 88px;
          }
        }

        .emotion-4 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          height: 100%;
          padding-right: 2.25rem;
        }

        .emotion-6 {
          font-size: 1.375rem;
          margin: 0;
        }

        @media only screen and (min-width: 500px) {
          .emotion-6 {
            -webkit-flex: 0 0 2.6875rem;
            -ms-flex: 0 0 2.6875rem;
            flex: 0 0 2.6875rem;
            line-height: 2.6875rem;
          }
        }

        .emotion-8 {
          position: relative;
          width: 22px;
          height: 22px;
          -webkit-animation-fill-mode: forwards;
          animation-fill-mode: forwards;
          -webkit-animation: animation-0 2s 0s infinite linear;
          animation: animation-0 2s 0s infinite linear;
          -webkit-flex: 0 0 auto;
          -ms-flex: 0 0 auto;
          flex: 0 0 auto;
          margin-left: 0.5rem;
          opacity: 1;
          position: absolute;
          right: 0;
          -webkit-transition: opacity 0.5s ease;
          transition: opacity 0.5s ease;
        }

        .emotion-9 {
          position: absolute;
          top: 0;
          bottom: auto;
          height: 11px;
          width: 11px;
          background-color: #fbe07f;
          border-radius: 100%;
          -webkit-animation-fill-mode: forwards;
          animation-fill-mode: forwards;
          -webkit-animation: animation-1 2s 0s infinite linear;
          animation: animation-1 2s 0s infinite linear;
        }

        .emotion-10 {
          position: absolute;
          top: auto;
          bottom: 0;
          height: 11px;
          width: 11px;
          background-color: #fbe07f;
          border-radius: 100%;
          -webkit-animation-fill-mode: forwards;
          animation-fill-mode: forwards;
          -webkit-animation: animation-1 2s -1s infinite linear;
          animation: animation-1 2s -1s infinite linear;
        }

        <div>
          <div
            class="emotion-0 emotion-1"
          >
            <a
              class="emotion-2 emotion-3"
            >
              <div
                class="emotion-4 emotion-5"
              >
                <h1
                  class="emotion-6 emotion-7"
                >
                  Budget
                </h1>
                <span
                  class="emotion-8"
                >
                  <span
                    class="emotion-9"
                  />
                  <span
                    class="emotion-10"
                  />
                </span>
              </div>
            </a>
          </div>
        </div>
      `);
    });
  });
});
