import React from 'react';
import { NavLink } from 'react-router-dom';

import { OVERVIEW_COLUMNS, OverviewHeader, OverviewColumn } from '~client/constants/data';
import * as Styled from './styles';

const OverviewTableHeader: React.FC = () => (
  <Styled.Header>
    {(Object.entries(OVERVIEW_COLUMNS) as [OverviewHeader, OverviewColumn][]).map(
      ([column, { name, link }]) => (
        <Styled.HeaderLink column={column} key={name}>
          {link && (
            <Styled.HeaderText as={NavLink} {...link}>
              {name}
            </Styled.HeaderText>
          )}
          {!link && <Styled.HeaderText>{name}</Styled.HeaderText>}
        </Styled.HeaderLink>
      ),
    )}
  </Styled.Header>
);

export default OverviewTableHeader;
