import styled from 'styled-components';
import { lighten } from 'polished';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { Page } from '~client/styled/shared/page';

export const PageList = styled(Page)`
    flex: 1 1 0;

    ${breakpoint(breakpoints.mobile)} {
        flex-flow: column;
    }
    ${breakpoint(breakpoints.tablet)} {
        flex-flow: row;
    }
`;

export const FlexShrink = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        ${PageList} & {
            display: flex !important;
            flex-flow: column !important;
            flex: 1 1 0 !important;
            min-height: 0 !important;
        }
    }
`;

export const PageListMain = styled(FlexShrink)`
    display: flex;
    flex-flow: column;
    min-height: 0;
    flex: 1 0 0;
    background: ${({ page }) => {
        const lightColor = page && colors[page] && colors[page].light;
        if (lightColor) {
            return lightColor;
        }
        const color = page && colors[page] && colors[page].main;
        if (color) {
            return lighten(0.4)(color);
        }

        return 'none';
    }};
    ${breakpoint(breakpoints.mobile)} {
        background: none;
    }
`;
