import { ComponentStory, ComponentMeta } from '@storybook/react';

import * as decorators from '../../.storybook/decorators';

import { PageOverview } from '~client/components/page-overview';
import { testNow } from '~client/test-data';

const componentMeta: ComponentMeta<typeof PageOverview> = {
  title: 'PageOverview',
  component: PageOverview,
  decorators: [
    decorators.mockWindowWidth(),
    decorators.fullVisual,
    decorators.mockToday(testNow),
    decorators.redux,
    decorators.gql(),
    decorators.router(),
  ],
};

export default componentMeta;

const Template: ComponentStory<typeof PageOverview> = (args) => <PageOverview {...args} />;

export const Main = Template.bind({});
