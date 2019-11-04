import styled from 'styled-components';
import { breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Row } from '~client/components/ListRowDesktop/styles';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const RowCreate = styled(Row)``;

export const AddButtonOuter = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            flex: 0 0 320px;
            border-right: none;
            z-index: 5;
        }
    }
`;
