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

const LogoStoryWrapper: React.FC = ({ children }) => (
  <div
    style={{
      background: rgb(150, 150, 150),
      height: rem(240),
      width: rem(240),
    }}
  >
    {children}
  </div>
);

const LogoIncomeTemplate: ComponentStory<typeof Logos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoIncome {...args} />
  </LogoStoryWrapper>
);
export const LogoIncome = LogoIncomeTemplate.bind({});
LogoIncome.args = {
  color: 'white',
};

const LogoBillsTemplate: ComponentStory<typeof Logos.LogoBills> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoBills {...args} />
  </LogoStoryWrapper>
);
export const LogoBills = LogoBillsTemplate.bind({});
LogoBills.args = {
  color: 'white',
};
