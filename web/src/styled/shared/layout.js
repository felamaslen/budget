import styled from 'styled-components';
import { breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const MobileOnly = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        display: none;
    }
`;

export const DesktopOnly = styled.div`
    display: none;
    ${breakpoint(breakpoints.mobile)} {
        display: ${({ displayType = 'block' }) => displayType};
    }
`;

export const InlineFlex = styled.span`
    display: inline-flex;
`;

export const Flex = styled.div`
    display: flex;
`;

export const FlexCenter = styled(Flex)`
    align-items: center;
`;

export const FlexColumn = styled(Flex)`
    flex-flow: column;
`;

export const InlineFlexCenter = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;
