import styled from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Row } from '~client/components/ListRowDesktop/styles';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const RowCreate = styled(Row)`
    flex: 0 0 auto;
    border-bottom: 1px solid ${colors['medium-very-light']};
`;

export const AddButtonOuter = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            flex: 0 0 330px;
            border-right: none;
            z-index: 5;
            ${breakpoint(breakpoints.tablet)} {
                flex: 0 0 322px;
            }
        }
    }
`;
