import { ComponentStory, ComponentMeta } from '@storybook/react';

import * as decorators from '../../.storybook/decorators';

import { AccessibleListStandard } from '~client/components/accessible-list/standard';
import { colors } from '~client/styled/variables';
import { PageListStandard } from '~client/types/gql';

const componentMeta: ComponentMeta<typeof AccessibleListStandard> = {
  title: 'AccessibleListStandard',
  component: AccessibleListStandard,
  decorators: [
    decorators.fullVisual,
    decorators.redux,
    decorators.router(['/food']),
    decorators.gql,
  ],
};

export default componentMeta;

const Template: ComponentStory<typeof AccessibleListStandard> = (args) => (
  <AccessibleListStandard {...args} />
);

export const AccessibleListFood = Template.bind({});
AccessibleListFood.args = {
  page: PageListStandard.Food,
  color: colors[PageListStandard.Food].main,
};
