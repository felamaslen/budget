import { ComponentStory, ComponentMeta } from '@storybook/react';
import { rem, rgb } from 'polished';

import { Header } from '~client/components/header';
import * as Logos from '~client/components/nav-bar/logos';

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

const LogoIncomeTemplate: ComponentStory<typeof Logos.LogoIncome> = (args) => (
  <div
    style={{
      background: rgb(100, 0, 0),
      height: rem(240),
      width: rem(240),
    }}
  >
    <Logos.LogoIncome {...args} />
  </div>
);
export const LogoIncome = LogoIncomeTemplate.bind({});
LogoIncome.args = {
  color: 'white',
};
