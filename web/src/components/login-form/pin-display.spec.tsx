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
      .emotion-0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-flex-flow: row nowrap;
        -webkit-flex-flow: row nowrap;
        -ms-flex-flow: row nowrap;
        flex-flow: row nowrap;
        margin-bottom: 10px;
      }

      @media only screen and (min-width: 500px) {
        .emotion-0 {
          margin: 0 0.75rem 1rem 0.75rem;
        }
      }

      .emotion-2 {
        background-color: #333;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 4rem;
        height: 3.75rem;
        margin: 0 0.375rem;
        position: relative;
      }

      .emotion-2 input {
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
        -ms-appearance: none;
        appearance: none;
        -moz-appearance: textfield;
      }

      .emotion-2 input:focus {
        background-color: #fefefe;
      }

      .emotion-2 input,
      .emotion-2 input:focus,
      .emotion-2 input:active {
        outline: none;
      }

      .emotion-2 input::-webkit-inner-spin-button,
      .emotion-2 input::-webkit-outer-spin-button {
        -webkit-apperance: none;
        display: none;
        margin: 0;
      }

      .emotion-2::after {
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
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
        opacity: 0;
        -webkit-transition: opacity linear 0.1s;
        transition: opacity linear 0.1s;
        z-index: 1;
      }

      .emotion-2 input,
      .emotion-2::after {
        font: inherit;
        height: 100%;
        position: absolute;
        top: 0;
        width: 100%;
      }

      .emotion-2::after {
        opacity: 1;
      }

      @media only screen and (min-width: 500px) {
        .emotion-2 {
          height: 5rem;
        }
      }

      .emotion-6 {
        background-color: #333;
        -webkit-flex: 1 0 0;
        -ms-flex: 1 0 0;
        flex: 1 0 0;
        font-size: 4rem;
        height: 3.75rem;
        margin: 0 0.375rem;
        position: relative;
      }

      .emotion-6 input {
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
        -ms-appearance: none;
        appearance: none;
        -moz-appearance: textfield;
      }

      .emotion-6 input:focus {
        background-color: #fefefe;
      }

      .emotion-6 input,
      .emotion-6 input:focus,
      .emotion-6 input:active {
        outline: none;
      }

      .emotion-6 input::-webkit-inner-spin-button,
      .emotion-6 input::-webkit-outer-spin-button {
        -webkit-apperance: none;
        display: none;
        margin: 0;
      }

      .emotion-6::after {
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
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
        opacity: 0;
        -webkit-transition: opacity linear 0.1s;
        transition: opacity linear 0.1s;
        z-index: 1;
      }

      .emotion-6 input,
      .emotion-6::after {
        font: inherit;
        height: 100%;
        position: absolute;
        top: 0;
        width: 100%;
      }

      @media only screen and (min-width: 500px) {
        .emotion-6 {
          height: 5rem;
        }
      }

      <div>
        <div
          class="emotion-0 emotion-1"
        >
          <div
            class="emotion-2 emotion-3"
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
            class="emotion-2 emotion-3"
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
            class="emotion-6 emotion-3"
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
            class="emotion-6 emotion-3"
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
