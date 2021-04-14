import React from 'react';
import type { RouteComponentProps } from 'react-router';

import { AccessibleListStandard } from '~client/components/accessible-list';
import type { StandardLabels } from '~client/components/accessible-list/standard';
import { pageColor } from '~client/modules/color';
import { colors } from '~client/styled/variables';
import { PageListStandard } from '~client/types/enum';

export * from '~client/components/page-funds';

const labelsIncome: StandardLabels = { cost: 'Value', shop: 'Place' };
export const Income: React.FC<RouteComponentProps> = () => (
  <AccessibleListStandard
    page={PageListStandard.Income}
    color={pageColor(colors.income.main)}
    labels={labelsIncome}
  />
);

export const Bills: React.FC<RouteComponentProps> = () => (
  <AccessibleListStandard page={PageListStandard.Bills} color={pageColor(colors.bills.main)} />
);

export const Food: React.FC<RouteComponentProps> = () => (
  <AccessibleListStandard page={PageListStandard.Food} color={pageColor(colors.food.main)} />
);

export const General: React.FC<RouteComponentProps> = () => (
  <AccessibleListStandard page={PageListStandard.General} color={pageColor(colors.general.main)} />
);

const labelsHoliday: StandardLabels = { category: 'Holiday' };
export const Holiday: React.FC<RouteComponentProps> = () => (
  <AccessibleListStandard
    page={PageListStandard.Holiday}
    color={pageColor(colors.holiday.main)}
    labels={labelsHoliday}
  />
);

export const Social: React.FC<RouteComponentProps> = () => (
  <AccessibleListStandard page={PageListStandard.Social} color={pageColor(colors.social.main)} />
);
