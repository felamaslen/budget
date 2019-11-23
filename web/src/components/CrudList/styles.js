import styled, { css } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { PageList, FlexShrink } from '~client/containers/PageList/styles';
import { NetWorthList } from '~client/components/NetWorthList/styles';

export const CrudList = styled(FlexShrink)`
    ${PageList} & {
        display: flex;
        flex-flow: column;
        min-height: 0;
        flex: 1 0 0;
    }

    ${NetWorthList} & {
        display: flex;
        width: ${({ active }) => (active ? 700 : 500)}px;
        flex: 0 0 480px;
        flex-flow: column;

        ${({ active }) =>
            active &&
            css`
                flex: 1;
                flex-flow: column;
                min-height: 0;
            `}
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
    ${NetWorthList} & {
        display: flex;
        flex: 1 1 0;
        width: 100%;

        ${({ active }) =>
            active
                ? css`
                      flex: 1 1 0;
                      flex-flow: column;
                      min-height: 0;
                  `
                : css`
                      display: grid;
                      grid-template-rows: 448px 32px;
                  `}
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

    ${NetWorthList} & {
        ${({ active }) =>
            active
                ? css`
                      flex: 1 1 0;
                      min-height: 0;
                      width: 100%;
                      position: relative;
                      background: ${colors.white};
                  `
                : css`
                      display: grid;
                      padding: 6px;
                      grid-row: 1;
                      grid-column: 1;
                      grid-gap: 6px;
                      grid-template-rows: repeat(6, 1fr);
                      grid-template-columns: repeat(5, 1fr);
                      &::after {
                          display: flex;
                          content: 'Latest';
                          align-items: center;
                          justify-content: center;
                          grid-row: 6;
                          grid-column: 3;
                          z-index: 2;
                          font-weight: bold;
                          text-transform: uppercase;
                          border: 2px dashed ${colors.light};
                          color: ${colors.light};
                          border-radius: 5px;
                      }
                  `}

        ${({ createActive }) =>
            createActive &&
            css`
                display: none;
            `};
    }
`;
