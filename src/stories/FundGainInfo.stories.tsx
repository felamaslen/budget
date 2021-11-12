import { ComponentStory, ComponentMeta } from '@storybook/react';
import { rgb } from 'polished';

import * as decorators from '../../.storybook/decorators';

import { FundGainInfo } from '~client/components/fund-gain-info';
import { FundRow } from '~client/components/page-funds/styles';

const componentMeta: ComponentMeta<typeof FundGainInfo> = {
  title: 'FundGainInfo',
  component: FundGainInfo,
  decorators: [decorators.styles, decorators.router(['/funds'])],
};

export default componentMeta;

const Template: ComponentStory<typeof FundGainInfo> = (args) => (
  <FundRow isSold={args.isSold}>
    <FundGainInfo {...args} />
  </FundRow>
);

export const Main = Template.bind({});
Main.args = {
  rowGains: {
    price: 1460,
    value: 8714423,
    gain: 0.381,
    gainAbs: 2344203,
    dayGain: 0.0076,
    dayGainAbs: 55842,
    color: rgb(30, 255, 128),
  },
  isSold: false,
};
