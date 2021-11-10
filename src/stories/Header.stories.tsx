import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Header } from '~client/components/header';

const componentMeta: ComponentMeta<typeof Header> = {
  title: 'Header',
  component: Header,
};

export default componentMeta;

const Template: ComponentStory<typeof Header> = (args) => <Header {...args} />;

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  loggedIn: true,
  onLogout: (): void => {
    /* pass */
  },
};

export const Anonymous = Template.bind({});
Anonymous.args = {
  loggedIn: false,
  onLogout: (): void => {
    /* pass */
  },
};
