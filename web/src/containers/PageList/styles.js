import styled from 'styled-components';
import { breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Page } from '~client/styled/shared/page';
import { PageFunds } from '~client/containers/PageFunds/styles';

export const PageList = styled(Page)`
    flex: 1 1 0;
`;

export const PageListMain = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        ${PageFunds} & {
            flex: 0 1 800px;
        }
    }
`;
