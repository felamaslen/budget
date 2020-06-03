import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { PinDisplay } from './pin-display';

describe('<PinDisplay />', () => {
  const props = {
    inputStep: 2,
    onFocus: jest.fn(),
    onInput: jest.fn(),
  };

  const setup = (): RenderResult => render(<PinDisplay {...props} />);

  it('should render four input boxes', () => {
    expect.assertions(1);
    const { container } = setup();
    expect(container).toMatchInlineSnapshot(`
      .c0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex-flow: row nowrap;
        -ms-flex-flow: row nowrap;
        flex-flow: row nowrap;
        margin-bottom: 10px;
      }

      .c1 {
        background-color: #333;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 64px;
        height: 3.75rem;
        margin: 0 0.375rem;
        position: relative;
      }

      .c1 input {
        background-color: transparent;
        border: none;
        border-radius: 4px;
        color: rgba(255,255,255,0);
        text-align: center;
        -webkit-transition: background-color linear 0.1s;
        transition: background-color linear 0.1s;
        z-index: 2;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        -moz-appearance: textfield;
      }

      .c1 input:focus {
        background-color: #fefefe;
      }

      .c1 input,
      .c1 input:focus,
      .c1 input:active {
        outline: none;
      }

      .c1 input::-webkit-inner-spin-button,
      .c1 input::-webkit-outer-spin-button {
        -webkit-apperance: none;
        display: none;
        margin: 0;
      }

      .c1::after {
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        display: -webkit-inline-box;
        display: -webkit-inline-flex;
        display: -ms-inline-flexbox;
        display: inline-flex;
        background-color: transparent;
        content: '•';
        color: #fefefe;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        -ms-flex-pack: center;
        justify-content: center;
        opacity: 0;
        -webkit-transition: opacity linear 0.1s;
        transition: opacity linear 0.1s;
        z-index: 1;
      }

      .c1 input,
      .c1::after {
        font: inherit;
        height: 100%;
        position: absolute;
        top: 0;
        width: 100%;
      }

      .c1::after {
        opacity: 1;
      }

      .c2 {
        background-color: #333;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 64px;
        height: 3.75rem;
        margin: 0 0.375rem;
        position: relative;
      }

      .c2 input {
        background-color: transparent;
        border: none;
        border-radius: 4px;
        color: rgba(255,255,255,0);
        text-align: center;
        -webkit-transition: background-color linear 0.1s;
        transition: background-color linear 0.1s;
        z-index: 2;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        -moz-appearance: textfield;
      }

      .c2 input:focus {
        background-color: #fefefe;
      }

      .c2 input,
      .c2 input:focus,
      .c2 input:active {
        outline: none;
      }

      .c2 input::-webkit-inner-spin-button,
      .c2 input::-webkit-outer-spin-button {
        -webkit-apperance: none;
        display: none;
        margin: 0;
      }

      .c2::after {
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        display: -webkit-inline-box;
        display: -webkit-inline-flex;
        display: -ms-inline-flexbox;
        display: inline-flex;
        background-color: transparent;
        content: '•';
        color: #fefefe;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        -ms-flex-pack: center;
        justify-content: center;
        opacity: 0;
        -webkit-transition: opacity linear 0.1s;
        transition: opacity linear 0.1s;
        z-index: 1;
      }

      .c2 input,
      .c2::after {
        font: inherit;
        height: 100%;
        position: absolute;
        top: 0;
        width: 100%;
      }

      @media only screen and (min-width:500px) {
        .c0 {
          margin: 0 12px 16px 12px;
        }
      }

      @media only screen and (min-width:500px) {
        .c1 {
          height: 5rem;
        }
      }

      @media only screen and (min-width:500px) {
        .c2 {
          height: 5rem;
        }
      }

      <div>
        <div
          class="c0"
        >
          <div
            class="c1"
          >
            <input
              max="9"
              min="0"
              step="1"
              tabindex="0"
              type="number"
              value=""
            />
          </div>
          <div
            class="c1"
          >
            <input
              max="9"
              min="0"
              step="1"
              tabindex="0"
              type="number"
              value=""
            />
          </div>
          <div
            class="c2"
          >
            <input
              max="9"
              min="0"
              step="1"
              tabindex="0"
              type="number"
              value=""
            />
          </div>
          <div
            class="c2"
          >
            <input
              disabled=""
              max="9"
              min="0"
              step="1"
              tabindex="-1"
              type="number"
              value=""
            />
          </div>
        </div>
      </div>
    `);
  });
});
