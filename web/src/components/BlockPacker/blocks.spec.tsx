/* eslint-disable max-len */
import { render, RenderResult } from '@testing-library/react';
import React from 'react';

import Blocks, { Props } from '~client/components/BlockPacker/blocks';
import { Page } from '~client/types/app';

describe('<BlockPacker /> / <Blocks />', () => {
  const props: Props = {
    blocks: [
      {
        width: 10,
        height: 10,
        bits: [
          {
            name: 'saved',
            color: 'teal',
            value: 8,
            width: 8,
            height: 7.3,
            blocks: [
              {
                width: 8,
                height: 7.3,
                bits: [
                  {
                    name: 'foo1',
                    value: 8,
                    color: 'ebony',
                    width: 3,
                    height: 2.9,
                  },
                ],
              },
            ],
          },
          {
            name: Page.social,
            color: 'cyan',
            value: 2,
            width: 1,
            height: 9.3,
            blocks: [
              {
                width: 1,
                height: 9.3,
                bits: [
                  {
                    name: 'bar1',
                    value: 2,
                    color: 'ebony',
                    width: 3,
                    height: 2.9,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        width: 3,
        height: 7,
        bits: [
          {
            name: Page.holiday,
            color: 'orange',
            value: 5,
            width: 3,
            height: 7,
            blocks: [],
          },
        ],
      },
    ],
    activeMain: null,
    activeSub: null,
    onClick: () => null,
    onHover: () => null,
  };

  const getBlocks = (customProps = {}): RenderResult =>
    render(<Blocks {...props} {...customProps} />);

  describe('<Blocks />', () => {
    it('should render a block tree', () => {
      expect.assertions(1);
      const { container } = getBlocks();
      expect(container).toMatchInlineSnapshot(`
        .c1 {
          float: left;
          display: inline-block;
        }

        .c2 {
          float: left;
          position: relative;
          box-shadow: inset 0 0 13px rgba(0,0,0,0.6);
          z-index: 1;
          background-image: none;
        }

        .c2:hover {
          z-index: 2;
          box-shadow: inset 0 0 13px rgba(0,0,0,0.2),0 0 16px 3px rgba(0,0,0,0.4);
        }

        .c2::after {
          background-image: linear-gradient( 45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent 0 );
          background-size: 16px 16px;
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
        }

        .c4 {
          float: left;
          position: relative;
          box-shadow: inset 0 0 13px rgba(0,0,0,0.6);
          z-index: 1;
        }

        .c4:hover {
          z-index: 2;
          box-shadow: inset 0 0 13px rgba(0,0,0,0.2),0 0 16px 3px rgba(0,0,0,0.4);
        }

        .c3 {
          float: left;
          position: relative;
          box-shadow: inset -1px -1px 13px rgba(0,0,0,0.4);
          background-image: linear-gradient( to bottom right, rgba(255,255,255,0.6), rgba(0,0,0,0.3) );
        }

        .c0 {
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

        <div>
          <div
            class="c0"
          >
            <div
              class="sc-AxjAm c1"
              height="10"
              style="width: 10px; height: 10px;"
              width="10"
            >
              <div
                class="sc-AxjAm sc-AxiKw c2"
                height="7.3"
                name="saved"
                style="background-color: rgb(17, 56, 34); width: 8px; height: 7.3px;"
                width="8"
              >
                <div
                  class="sc-AxjAm c1"
                  height="7.3"
                  style="width: 8px; height: 7.3px;"
                  width="8"
                >
                  <div
                    class="sc-AxjAm sc-AxiKw c3"
                    height="2.9"
                    style="width: 3px; height: 2.9px;"
                    width="3"
                  />
                </div>
              </div>
              <div
                class="sc-AxjAm sc-AxiKw c4"
                height="9.3"
                name="social"
                style="background-color: rgb(191, 158, 36); width: 1px; height: 9.3px;"
                width="1"
              >
                <div
                  class="sc-AxjAm c1"
                  height="9.3"
                  style="width: 1px; height: 9.3px;"
                  width="1"
                >
                  <div
                    class="sc-AxjAm sc-AxiKw c3"
                    height="2.9"
                    style="width: 3px; height: 2.9px;"
                    width="3"
                  />
                </div>
              </div>
            </div>
            <div
              class="sc-AxjAm c1"
              height="7"
              style="width: 3px; height: 7px;"
              width="3"
            >
              <div
                class="sc-AxjAm sc-AxiKw c4"
                height="7"
                name="holiday"
                style="background-color: rgb(0, 137, 123); width: 3px; height: 7px;"
                width="3"
              />
            </div>
          </div>
        </div>
      `);
    });
  });
});
