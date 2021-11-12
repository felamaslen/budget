import { ComponentMeta, ComponentStory } from '@storybook/react';
import { rem, rgb } from 'polished';

import * as NavBarLogos from '~client/components/nav-bar/logos';
import { Receipt as ReceiptIcon } from '~client/components/page-overview/receipt';

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

const componentMeta: ComponentMeta<typeof LogoStoryWrapper> = {
  title: 'Logos',
  component: LogoStoryWrapper,
};

export default componentMeta;

const OverviewTemplate: ComponentStory<typeof NavBarLogos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoOverview {...args} />
  </LogoStoryWrapper>
);
export const Overview = OverviewTemplate.bind({});

const PlanningTemplate: ComponentStory<typeof NavBarLogos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoPlanning {...args} />
  </LogoStoryWrapper>
);
export const Planning = PlanningTemplate.bind({});

const AnalysisTemplate: ComponentStory<typeof NavBarLogos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoAnalysis {...args} />
  </LogoStoryWrapper>
);
export const Analysis = AnalysisTemplate.bind({});

const FundsTemplate: ComponentStory<typeof NavBarLogos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoFunds {...args} />
  </LogoStoryWrapper>
);
export const Funds = FundsTemplate.bind({});

const IncomeTemplate: ComponentStory<typeof NavBarLogos.LogoIncome> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoIncome {...args} />
  </LogoStoryWrapper>
);
export const Income = IncomeTemplate.bind({});

const BillsTemplate: ComponentStory<typeof NavBarLogos.LogoBills> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoBills {...args} />
  </LogoStoryWrapper>
);
export const Bills = BillsTemplate.bind({});

const FoodTemplate: ComponentStory<typeof NavBarLogos.LogoFood> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoFood {...args} />
  </LogoStoryWrapper>
);
export const Food = FoodTemplate.bind({});

const GeneralTemplate: ComponentStory<typeof NavBarLogos.LogoGeneral> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoGeneral {...args} />
  </LogoStoryWrapper>
);
export const General = GeneralTemplate.bind({});

const HolidayTemplate: ComponentStory<typeof NavBarLogos.LogoHoliday> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoHoliday {...args} />
  </LogoStoryWrapper>
);
export const Holiday = HolidayTemplate.bind({});

const SocialTemplate: ComponentStory<typeof NavBarLogos.LogoSocial> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoSocial {...args} />
  </LogoStoryWrapper>
);
export const Social = SocialTemplate.bind({});

const LogoutTemplate: ComponentStory<typeof NavBarLogos.LogoLogout> = (args) => (
  <LogoStoryWrapper>
    <NavBarLogos.LogoLogout {...args} />
  </LogoStoryWrapper>
);
export const Logout = LogoutTemplate.bind({});

const ReceiptTemplate: ComponentStory<typeof ReceiptIcon> = (args) => <ReceiptIcon {...args} />;

export const Receipt = ReceiptTemplate.bind({});
