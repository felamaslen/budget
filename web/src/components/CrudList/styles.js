import styled from 'styled-components';
import { breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { PageList, FlexShrink } from '~client/containers/PageList/styles';

export const CrudList = styled(FlexShrink)`
    ${PageList} & {
        display: flex;
        flex-flow: column;
        min-height: 0;
        flex: 1 0 0;
    }
`;

export const CrudListInner = styled.div`
    ${PageList} & {
        display: flex;
        flex: 1 0 0;
        z-index: 5;
        margin: 0;
        padding: 0;
        flex-flow: column nowrap;
        overflow-y: auto;
    }
    ${breakpoint(breakpoints.mobile)} {
        ${PageList} & {
            display: flex;
            margin: 0;
            flex: 1 1 0;
            min-height: 0;
            flex-flow: column;
            position: relative;
            overflow-y: initial;
            list-style: none;
            width: 100%;
        }
    }
`;

export const CrudWindow = styled.div`
    ${PageList} & {
        display: flex;
        flex-flow: column;
        flex: 1 1 0;
        min-height: 0;
    }
`;
