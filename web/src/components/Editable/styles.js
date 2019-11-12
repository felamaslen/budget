import styled from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Cell } from '~client/components/ListRowCell/styles';

export const Editable = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        ${Cell} & {
            border-right: 1px solid ${colors['slightly-light']};
            height: inherit;
        }
    }
`;
