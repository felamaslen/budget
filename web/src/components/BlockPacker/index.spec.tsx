import { render, fireEvent, RenderResult, act } from '@testing-library/react';
import React from 'react';

import BlockPacker, { Props } from '.';
import { Page } from '~client/types/app';

describe('<BlockPacker />', () => {
  const props: Props = {
    blocks: [
      {
        width: 10.4,
        height: 11.5,
        bits: [
          {
            name: Page.food,
            value: 5.1,
            color: 'black',
            width: 8,
            height: 9.3,
            blocks: [
              {
                width: 4.9,
                height: 9.21,
                bits: [
                  {
                    name: 'foo1',
                    value: 3,
                    color: 'teal',
                    width: 3,
                    height: 3.1,
                  },
                ],
              },
            ],
          },
          {
            name: Page.general,
            value: 5.2,
            width: 3,
            height: 3.1,
            color: 'red',
            blocks: [
              {
                width: 3,
                height: 3.1,
                bits: [
                  {
                    name: 'bar1',
                    value: 4,
                    color: 'teal',
                    width: 3,
                    height: 3.1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    activeMain: 'not_foo',
    activeSub: 'not_bar',
    status: 'some-status bar',
    onClick: jest.fn(),
    onHover: jest.fn(),
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<BlockPacker {...props} {...customProps} />);

  it('should render a block tree', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    expect(getByTestId('block-tree')).toMatchInlineSnapshot(`
      .c2 {
        float: left;
        display: inline-block;
      }

      .c3 {
        float: left;
        position: relative;
        box-shadow: inset 0 0 13px rgba(0,0,0,0.6);
        z-index: 1;
      }

      .c3:hover {
        z-index: 2;
        box-shadow: inset 0 0 13px rgba(0,0,0,0.2),0 0 16px 3px rgba(0,0,0,0.4);
      }

      .c4 {
        float: left;
        position: relative;
        box-shadow: inset -1px -1px 13px rgba(0,0,0,0.4);
        background-image: linear-gradient( to bottom right, rgba(255,255,255,0.6), rgba(0,0,0,0.3) );
      }

      .c0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex-flow: row;
        -ms-flex-flow: row;
        flex-flow: row;
        -webkit-box-flex: 1;
        -webkit-flex-grow: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        width: 100%;
        position: relative;
      }

      .c1 {
        z-index: 1;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        box-shadow: 0 3px 13px rgba(0,0,0,0.6);
      }

      @media only screen and (min-width:350px) {

      }

      @media only screen and (min-width:690px) {

      }

      @media only screen and (min-width:1200px) {

      }

      <div
        class="c0"
        data-testid="block-tree"
      >
        <div
          class="c1"
        >
          <div
            class="sc-AxjAm c2"
            height="11.5"
            style="width: 10.4px; height: 11.5px;"
            width="10.4"
          >
            <div
              class="sc-AxjAm sc-AxiKw c3"
              height="9.3"
              name="food"
              style="background-color: rgb(67, 160, 71); width: 8px; height: 9.3px;"
              width="8"
            >
              <div
                class="sc-AxjAm c2"
                height="9.21"
                style="width: 4.9px; height: 9.21px;"
                width="4.9"
              >
                <div
                  class="sc-AxjAm sc-AxiKw c4"
                  height="3.1"
                  style="width: 3px; height: 3.1px;"
                  width="3"
                />
              </div>
            </div>
            <div
              class="sc-AxjAm sc-AxiKw c3"
              height="3.1"
              name="general"
              style="background-color: rgb(1, 87, 155); width: 3px; height: 3.1px;"
              width="3"
            >
              <div
                class="sc-AxjAm c2"
                height="3.1"
                style="width: 3px; height: 3.1px;"
                width="3"
              >
                <div
                  class="sc-AxjAm sc-AxiKw c4"
                  height="3.1"
                  style="width: 3px; height: 3.1px;"
                  width="3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  it('should render a status bar', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    expect(getByTestId('status-bar')).toHaveTextContent('some-status bar');
  });

  it('should call onHover with null when mousing out of the tree', () => {
    expect.assertions(2);
    const { getByTestId } = getContainer();
    act(() => {
      fireEvent.mouseOut(getByTestId('block-tree'));
    });
    expect(props.onHover).toHaveBeenCalledTimes(1);
    expect(props.onHover).toHaveBeenCalledWith(null);
  });

  it('should not render blocks if they are null', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer({ blocks: null });
    expect(getByTestId('block-tree')).toMatchInlineSnapshot(`
      .c0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex-flow: row;
        -ms-flex-flow: row;
        flex-flow: row;
        -webkit-box-flex: 1;
        -webkit-flex-grow: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        width: 100%;
        position: relative;
      }

      @media only screen and (min-width:350px) {

      }

      @media only screen and (min-width:690px) {

      }

      @media only screen and (min-width:1200px) {

      }

      <div
        class="c0"
        data-testid="block-tree"
      />
    `);
  });
});
