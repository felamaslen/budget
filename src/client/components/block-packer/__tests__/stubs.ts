import type { Props } from '..';

import { blockPacker } from '~client/modules/block-packer';
import { BlockItem } from '~client/types';

export const blocks = blockPacker<BlockItem>(10, 6, [
  {
    name: 'parent block 1',
    total: 24,
    color: 'darkorange',
    subTree: [
      {
        name: 'child block A',
        total: 8,
      },
      {
        name: 'child block B',
        total: 14,
      },
      {
        name: 'child block C',
        total: 2,
      },
    ],
  },
  {
    name: 'parent block 2',
    total: 36,
    color: 'purple',
    hasBreakdown: true,
  },
]);

export const props: Props = {
  blocks,
  activeBlocks: ['not_foo', 'not_bar'],
  status: 'some-status bar',
  onClick: jest.fn(),
  onHover: jest.fn(),
};
