import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import AppLogo from '.';

describe('<AppLogo />', () => {
  const props = {
    loading: false,
    unsaved: false,
  };

  const setup = (customProps = {}): RenderResult => render(<AppLogo {...props} {...customProps} />);

  it('should render a logo', () => {
    expect.assertions(1);
    const { container } = setup();
    expect(container).toMatchInlineSnapshot(`
      .c0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 0 0 55px;
        -ms-flex: 0 0 55px;
        flex: 0 0 55px;
        -webkit-flex-flow: row-reverse;
        -ms-flex-flow: row-reverse;
        flex-flow: row-reverse;
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: end;
        -webkit-justify-content: flex-end;
        -ms-flex-pack: end;
        justify-content: flex-end;
        padding: 0 0.5em;
        width: 100%;
        background: #9f3030;
      }

      .c1 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        position: relative;
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        line-height: 55px;
        font-family: Ubuntu,Georgia,serif;
        font-weight: bold;
        font-size: 22px;
      }

      .c1::before {
        display: inline-block;
        -webkit-flex: 0 0 38px;
        -ms-flex: 0 0 38px;
        flex: 0 0 38px;
        content: '';
        width: 30px;
        height: 30px;
        background: url(path/to/test/file) 0 -56px;
      }

      @media only screen and (min-width:500px) {
        .c0 {
          -webkit-flex: 0 0 auto;
          -ms-flex: 0 0 auto;
          flex: 0 0 auto;
          -webkit-flex-flow: row;
          -ms-flex-flow: row;
          flex-flow: row;
          margin: 0 1em 0 0.5em;
          width: auto;
          height: 49;
          background: none;
        }
      }

      <div>
        <div
          class="c0"
        >
          <a
            class="c1"
          >
            <span>
              Budget
            </span>
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

  describe('if the queue is not saved', () => {
    const propsUnsaved = {
      ...props,
      unsaved: true,
    };

    it('should render a message', () => {
      expect.assertions(1);
      const { getByText } = setup(propsUnsaved);
      expect(getByText('Unsaved changes!')).toBeInTheDocument();
    });
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
        .c0 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex: 0 0 55px;
          -ms-flex: 0 0 55px;
          flex: 0 0 55px;
          -webkit-flex-flow: row-reverse;
          -ms-flex-flow: row-reverse;
          flex-flow: row-reverse;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-pack: end;
          -webkit-justify-content: flex-end;
          -ms-flex-pack: end;
          justify-content: flex-end;
          padding: 0 0.5em;
          width: 100%;
          background: #9f3030;
        }

        .c1 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          position: relative;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          line-height: 55px;
          font-family: Ubuntu,Georgia,serif;
          font-weight: bold;
          font-size: 22px;
        }

        .c1::before {
          display: inline-block;
          -webkit-flex: 0 0 38px;
          -ms-flex: 0 0 38px;
          flex: 0 0 38px;
          content: '';
          width: 30px;
          height: 30px;
          background: url(path/to/test/file) 0 -56px;
        }

        .c2 {
          width: 34px;
          height: 34px;
          position: absolute;
          left: -2px;
          border-radius: 100%;
          border: 4px solid transparent;
          border-top: 4px solid #fbe07f;
          -webkit-animation: spin 1s infinite ease;
          animation: spin 1s infinite ease;
        }

        @media only screen and (min-width:500px) {
          .c0 {
            -webkit-flex: 0 0 auto;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            -webkit-flex-flow: row;
            -ms-flex-flow: row;
            flex-flow: row;
            margin: 0 1em 0 0.5em;
            width: auto;
            height: 49;
            background: none;
          }
        }

        <div>
          <div
            class="c0"
          >
            <a
              class="c1"
            >
              <span>
                Budget
              </span>
              <span
                class="c2"
              />
            </a>
          </div>
        </div>
      `);
    });
  });
});
