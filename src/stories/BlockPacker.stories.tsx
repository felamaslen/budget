import { ComponentStory, ComponentMeta } from '@storybook/react';

import * as decorators from '../../.storybook/decorators';

import { BlockPacker } from '~client/components/block-packer';
import * as stubs from '~client/components/block-packer/__tests__/stubs';
import { VOID } from '~client/modules/data';

const componentMeta: ComponentMeta<typeof BlockPacker> = {
  title: 'BlockPacker',
  component: BlockPacker,
  decorators: [decorators.styles],
};

export default componentMeta;

const Template: ComponentStory<typeof BlockPacker> = (args) => (
  <div style={{ height: 240, width: 360 }}>
    <BlockPacker {...args} />
  </div>
);

export const Main = Template.bind({});
Main.args = {
  blocks: stubs.blocks,
  activeBlocks: ['not_foo', 'not_bar'],
  status: 'some-status bar',
  onClick: VOID,
  onHover: VOID,
};
