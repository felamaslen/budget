import React from 'react';
import { NavLink } from 'react-router-dom';

import { OVERVIEW_COLUMNS } from '~client/constants/data';

import * as Styled from './styles';

const OverviewTableHeader = () => (
    <Styled.Header>
        {OVERVIEW_COLUMNS.map(([column, name, link = null]) => (
            <Styled.HeaderLink column={column} key={name}>
                {link && (
                    <Styled.HeaderText as={NavLink} {...link}>
                        {name}
                    </Styled.HeaderText>
                )}
                {!link && <Styled.HeaderText>{name}</Styled.HeaderText>}
            </Styled.HeaderLink>
        ))}
    </Styled.Header>
);

export default OverviewTableHeader;
