import { ComponentStory, ComponentMeta } from '@storybook/react';
import { endOfDay } from 'date-fns';

import * as decorators from '../../.storybook/decorators';

import { GraphBalance } from '~client/components/graph-balance';
import { VOID } from '~client/modules/data';
import { getOverviewGraphValues } from '~client/selectors';
import { testNow, testState } from '~client/test-data';

const componentMeta: ComponentMeta<typeof GraphBalance> = {
  title: 'GraphBalance',
  component: GraphBalance,
  decorators: [decorators.styles, decorators.mockWindowWidth(), decorators.mockToday(testNow)],
};

export default componentMeta;

const Template: ComponentStory<typeof GraphBalance> = (args) => <GraphBalance {...args} />;

const today = endOfDay(testNow);
const graph = getOverviewGraphValues(today, 0)(testState);

export const Main = Template.bind({});
Main.args = {
  isMobile: false,
  showAll: false,
  setShowAll: VOID,
  setMobileGraph: VOID,
  isLoading: false,
  graph,
  longTermOptions: { enabled: false, rates: {} },
  setLongTermOptions: VOID,
  defaultRates: { years: 30, income: 488500, stockPurchase: 255000, xirr: 0.18 },
};
