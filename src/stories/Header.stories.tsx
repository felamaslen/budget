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

const LogoOverviewTemplate: ComponentStory<typeof Logos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoOverview {...args} />
  </LogoStoryWrapper>
);
export const LogoOverview = LogoOverviewTemplate.bind({});
LogoOverview.args = {
  color: 'white',
};

const LogoPlanningTemplate: ComponentStory<typeof Logos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoPlanning {...args} />
  </LogoStoryWrapper>
);
export const LogoPlanning = LogoPlanningTemplate.bind({});
LogoPlanning.args = {
  color: 'white',
};

const LogoAnalysisTemplate: ComponentStory<typeof Logos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoAnalysis {...args} />
  </LogoStoryWrapper>
);
export const LogoAnalysis = LogoAnalysisTemplate.bind({});
LogoAnalysis.args = {
  color: 'white',
};

const LogoFundsTemplate: ComponentStory<typeof Logos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoFunds {...args} />
  </LogoStoryWrapper>
);
export const LogoFunds = LogoFundsTemplate.bind({});
LogoFunds.args = {
  color: 'white',
};

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

const LogoFoodTemplate: ComponentStory<typeof Logos.LogoFood> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoFood {...args} />
  </LogoStoryWrapper>
);
export const LogoFood = LogoFoodTemplate.bind({});
LogoFood.args = {
  color: 'white',
};

const LogoGeneralTemplate: ComponentStory<typeof Logos.LogoGeneral> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoGeneral {...args} />
  </LogoStoryWrapper>
);
export const LogoGeneral = LogoGeneralTemplate.bind({});
LogoGeneral.args = {
  color: 'white',
};

const LogoHolidayTemplate: ComponentStory<typeof Logos.LogoHoliday> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoHoliday {...args} />
  </LogoStoryWrapper>
);
export const LogoHoliday = LogoHolidayTemplate.bind({});
LogoHoliday.args = {
  color: 'white',
};

const LogoSocialTemplate: ComponentStory<typeof Logos.LogoSocial> = (args) => (
  <LogoStoryWrapper>
    <Logos.LogoSocial {...args} />
  </LogoStoryWrapper>
);
export const LogoSocial = LogoSocialTemplate.bind({});
LogoSocial.args = {
  color: 'white',
};
