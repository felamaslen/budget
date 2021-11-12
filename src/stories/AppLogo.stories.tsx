import { ComponentStory, ComponentMeta } from '@storybook/react';

import * as decorators from '../../.storybook/decorators';

import { AppLogo } from '~client/components/app-logo';
import { Header } from '~client/components/header/styles';

const componentMeta: ComponentMeta<typeof AppLogo> = {
  title: 'AppLogo',
  component: AppLogo,
  decorators: [decorators.styles, decorators.redux],
};

export default componentMeta;

const Template: ComponentStory<typeof AppLogo> = (args) => (
  <Header>
    <AppLogo {...args} />
  </Header>
);

export const Main = Template.bind({});
Main.args = {
  loading: false,
};
