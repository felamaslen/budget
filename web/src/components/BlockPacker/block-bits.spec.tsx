import { render, fireEvent, RenderResult, act } from '@testing-library/react';
import React from 'react';

import BlockBits, {
  Props,
  BlockGroup,
  PropsBlockGroup,
  SubBlock,
  PropsSubBlock,
} from '~client/components/BlockPacker/block-bits';
import { Page } from '~client/types/app';

describe('<BlockPacker /> / <BlockBits />', () => {
  const propsSubBlock: PropsSubBlock = {
    name: 'foo',
    value: 101.5,
    subBlockBit: {
      name: 'bar',
      color: 'red',
      value: 53.24,
      width: 90,
      height: 87,
    },
    onHover: jest.fn(),
  };
  const getSubBlock = (customProps = {}): RenderResult =>
    render(<SubBlock {...propsSubBlock} {...customProps} />);

  describe('<SubBlock />', () => {
    it('should render a subblock with the correct dimensions', () => {
      expect.assertions(1);
      const { container } = getSubBlock();
      const div = container.childNodes[0];
      expect(div).toHaveStyle({
        width: '90px',
        height: '87px',
      });
    });

    it('should call onHover when moused over', () => {
      expect.assertions(2);
      const { container } = getSubBlock();
      const div = container.childNodes[0];
      act(() => {
        fireEvent.mouseOver(div);
      });
      expect(propsSubBlock.onHover).toHaveBeenCalledTimes(1);
      expect(propsSubBlock.onHover).toHaveBeenCalledWith('foo', 'bar');
    });
  });

  const propsBlockGroup: PropsBlockGroup = {
    name: 'foo',
    value: 987,
    activeSub: null,
    onHover: () => null,
    subBlock: {
      bits: [
        {
          name: 'foo',
          color: 'red',
          value: 3,
          width: 1,
          height: 1,
        },
        {
          name: 'bar',
          color: 'green',
          value: 5,
          width: 1,
          height: 1,
        },
      ],
      width: 15,
      height: 13,
    },
  };

  const getBlockGroup = (customProps = {}): RenderResult =>
    render(<BlockGroup {...propsBlockGroup} {...customProps} />);

  describe('<BlockGroup />', () => {
    it('should render a block group with the correct dimensions', () => {
      expect.assertions(1);
      const { container } = getBlockGroup();
      const div = container.childNodes[0];
      expect(div).toHaveStyle({
        width: '15px',
        height: '13px',
      });
    });
  });

  const props: Props = {
    blockBit: {
      name: Page.bills,
      value: 1001.3,
      color: 'red',
      blocks: [
        {
          bits: [
            {
              name: 'foo',
              color: 'pink',
              value: 3,
              width: 1,
              height: 1,
            },
            {
              name: 'bar',
              color: 'turquoise',
              value: 5,
              width: 1,
              height: 1,
            },
          ],
          width: 15,
          height: 13,
        },
      ],
      width: 21,
      height: 13,
    },
    activeSub: null,
    deep: null,
    onHover: jest.fn(),
    onClick: jest.fn(),
  };

  const getBlockBits = (customProps = {}): RenderResult =>
    render(<BlockBits {...props} {...customProps} />);

  describe('<BlockBits />', () => {
    it('should render a list of blocks', () => {
      expect.assertions(1);
      const { container } = getBlockBits();
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="sc-bdVaJa sc-htpNat sc-bxivhb Wlpig"
            height="13"
            name="bills"
            style="background-color: rgb(183, 28, 28); width: 21px; height: 13px;"
            width="21"
          >
            <div
              class="sc-bdVaJa sc-bwzfXH iEDPNl"
              height="13"
              style="width: 15px; height: 13px;"
              width="15"
            >
              <div
                class="sc-bdVaJa sc-htpNat sc-EHOje hshgXl"
                height="1"
                style="width: 1px; height: 1px;"
                width="1"
              />
              <div
                class="sc-bdVaJa sc-htpNat sc-EHOje hshgXl"
                height="1"
                style="width: 1px; height: 1px;"
                width="1"
              />
            </div>
          </div>
        </div>
      `);
    });

    it('should render nothing if there are no sub blocks', () => {
      expect.assertions(1);
      const { container } = getBlockBits({
        blockBit: {
          name: Page.food,
          value: 1001.3,
          color: 'red',
          width: 21,
          height: 13,
        },
      });
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="sc-bdVaJa sc-htpNat sc-bxivhb Wlpig"
            height="13"
            name="food"
            style="background-color: rgb(67, 160, 71); width: 21px; height: 13px;"
            width="21"
          />
        </div>
      `);
    });
  });
});
