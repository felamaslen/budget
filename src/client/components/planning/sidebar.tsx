import React from 'react';

import { AddAccount } from './accounts';
import { Rates, Props as PropsRates } from './rates';
import * as Styled from './styles';

export type Props = Pick<PropsRates, 'year'>;

export const Sidebar: React.FC<Props> = ({ year }) => (
  <Styled.Sidebar>
    <Rates year={year} />
    <AddAccount />
  </Styled.Sidebar>
);
