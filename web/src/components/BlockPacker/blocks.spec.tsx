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
        <div>
          <div
            class="sc-htoDjs gGwFxh"
          >
            <div
              class="sc-bdVaJa sc-bwzfXH iEDPNl"
              height="10"
              style="width: 10px; height: 10px;"
              width="10"
            >
              <div
                class="sc-bdVaJa sc-htpNat sc-bxivhb TNtGE"
                height="7.3"
                name="saved"
                style="background-color: rgb(17, 56, 34); width: 8px; height: 7.3px;"
                width="8"
              >
                <div
                  class="sc-bdVaJa sc-bwzfXH iEDPNl"
                  height="7.3"
                  style="width: 8px; height: 7.3px;"
                  width="8"
                >
                  <div
                    class="sc-bdVaJa sc-htpNat sc-EHOje hshgXl"
                    height="2.9"
                    style="width: 3px; height: 2.9px;"
                    width="3"
                  />
                </div>
              </div>
              <div
                class="sc-bdVaJa sc-htpNat sc-bxivhb Wlpig"
                height="9.3"
                name="social"
                style="background-color: rgb(191, 158, 36); width: 1px; height: 9.3px;"
                width="1"
              >
                <div
                  class="sc-bdVaJa sc-bwzfXH iEDPNl"
                  height="9.3"
                  style="width: 1px; height: 9.3px;"
                  width="1"
                >
                  <div
                    class="sc-bdVaJa sc-htpNat sc-EHOje hshgXl"
                    height="2.9"
                    style="width: 3px; height: 2.9px;"
                    width="3"
                  />
                </div>
              </div>
            </div>
            <div
              class="sc-bdVaJa sc-bwzfXH iEDPNl"
              height="7"
              style="width: 3px; height: 7px;"
              width="3"
            >
              <div
                class="sc-bdVaJa sc-htpNat sc-bxivhb Wlpig"
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
