import { ComponentStory, ComponentMeta } from '@storybook/react';
import { endOfDay } from 'date-fns';

import * as decorators from '../../.storybook/decorators';

import { GraphSpending } from '~client/components/graph-spending';
import { VOID } from '~client/modules/data';
import { getOverviewGraphValues } from '~client/selectors';
import { testNow, testState } from '~client/test-data';

const componentMeta: ComponentMeta<typeof GraphSpending> = {
  title: 'GraphSpending',
  component: GraphSpending,
  decorators: [decorators.styles, decorators.mockWindowWidth(), decorators.mockToday(testNow)],
};

export default componentMeta;

const Template: ComponentStory<typeof GraphSpending> = (args) => <GraphSpending {...args} />;

const today = endOfDay(testNow);
const graph = getOverviewGraphValues(today, 0)(testState);

export const Main = Template.bind({});
Main.args = {
  isMobile: false,
  showAll: false,
  setShowAll: VOID,
  longTerm: false,
  investments: Array(graph.values.income.length).fill(0),
  graph,
  initialCumulativeValues: { spending: 0, income: 0 },
  setMobileGraph: VOID,
};
