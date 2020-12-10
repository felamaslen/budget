import React from 'react';

import { AccessibleListStandard, AccessibleListDaily } from '~client/components/accessible-list';
import { pageColor } from '~client/modules/color';
import { colors } from '~client/styled/variables';
import { PageListStandard, PageListExtended } from '~client/types';

export * from '~client/components/page-funds';

export const Income: React.FC = () => (
  <AccessibleListStandard page={PageListStandard.Income} color={pageColor(colors.income.main)} />
);

export const Bills: React.FC = () => (
  <AccessibleListStandard page={PageListStandard.Bills} color={pageColor(colors.bills.main)} />
);

export const Food: React.FC = () => (
  <AccessibleListDaily page={PageListExtended.Food} color={pageColor(colors.food.main)} />
);

export const General: React.FC = () => (
  <AccessibleListDaily page={PageListExtended.General} color={pageColor(colors.general.main)} />
);

export const Holiday: React.FC = () => (
  <AccessibleListDaily
    page={PageListExtended.Holiday}
    color={pageColor(colors.holiday.main)}
    categoryLabel="holiday"
  />
);

export const Social: React.FC = () => (
  <AccessibleListDaily
    page={PageListExtended.Social}
    color={pageColor(colors.social.main)}
    categoryLabel="society"
  />
);
