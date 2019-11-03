import styled from 'styled-components';
import { Page as PageBase } from '~client/styled/shared/page';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const Input = styled.span`;
    display: block;
    margin: 0.3em 0;
    text-align: center;
    text-transform: capitalize;

    ${breakpoint(breakpoints.mobile)} {
        margin: 0 0 0 0.5em;
        padding: 0.5em 0.5em 0.5em 0;
        border-right: 2px solid ${colors['medium-light']};
    }

    ${breakpoint(breakpoints.tablet)} {
        display: inline;
        margin: 0 1em;
        padding: 0;
        border-right: none;
    }
`;

export const Button = styled.button`
    margin: 0 0.3em;
    flex-basis: 0;
    flex-grow: 1;
    font-size: 0.75em;
`;

export const Buttons = styled.div`
    display: flex;
    width: 100%;
    flex-flow: row nowrap;
    margin: 0.3em 0;

    ${breakpoint(breakpoints.mobile)} {
        margin-left: 0.5em;
        width: auto;
    }

    ${breakpoint(breakpoints.tablet)} {
        float: right;
    }
`;

export const PeriodTitle = styled.h3`
    width: 100%;
    margin: 0;
    text-align: center;

    ${breakpoint(breakpoints.mobile)} {
        width: 100%;
    }

    ${breakpoint(breakpoints.tablet)} {
        margin: 5px 10px;
        font-size: 1.2em;
        text-align: left;
    }
`;

export const Upper = styled.div`
    display: flex;
    flex-wrap: wrap;

    ${breakpoint(breakpoints.mobile)} {
        flex-flow: row wrap;
    }

    ${breakpoint(breakpoints.tablet)} {
        display: block;
        margin: 4px 0;
    }
`;

const indicatorColors = {
    bills: colors.bills.main,
    general: colors.general.main,
    food: colors.food.main,
    holiday: colors.holiday.main,
    social: colors.social.main,
    saved: colors.blockColor.saved,
};

export const TreeMain = styled.div`
    &::before {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 5px 0 5px 8.7px;
        border-color: transparent;
        border-left-color: black;

        ${({ open }) => open && `
            border-left-color: transparent;
            border-top-color: black;
            border-width: 8.7px 5px 0 5px;
        `}
    }
`;

export const TreeIndicator = styled.span`
    display: flex;
    flex-basis: 16px !important;
    width: 16px;
    height: 16px;
    margin-left: 14px;
    background: ${({ name }) => (indicatorColors[name] || 'transparent')};
`;

export const TreeTitle = styled.span`
    flex-grow: 2;
    text-transform: capitalize;
`;

export const TreeValue = styled.span`
    flex-grow: 1;
    justify-content: flex-end;
`;

export const TreeListItemInner = styled.div`
`;

export const TreeListItem = styled.li`
    display: flex;
    flex-flow: column;

    line-height: 1.5em;
    white-space: nowrap;
    cursor: pointer;
    span {
        display: flex;
        flex-basis: 0;
    }

    ${({ open }) => open && `
        & > ${TreeMain}::before {
        }
    `}
`;

export const TreeListSelected = styled.div`
    &:before {
        content: "(";
    }
    &:after {
        content: ")";
    }
`;

export const TreeListHeadItem = styled(TreeListItem)`
    font-weight: bold;
    height: 3em;

    ${TreeListItemInner} {
        display: flex;
        flex-flow: row nowrap;
    }
    ${TreeValue} {
        display: flex;
        flex-flow: column;
        text-align: right;
    }
`;

export const SubTree = styled.ul`
    margin: 0 0.5em 0 3em;
    padding: 0;
    list-style: none;
    background: ${colors['highlight-light']};
    ${TreeMain} {
        display: flex;
        font-size: 0.9em;
    }

    ${TreeListItem} {
        ${TreeTitle} {
            margin-right: 4px;
            overflow: hidden;
        }
    }
`;

export const Tree = styled.div`
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    padding: 0.3em;
`;

export const TreeList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    & > ${TreeListItem} {
        position: relative;
        &:nth-child(2n+1) > ${TreeMain} {
            background: ${colors.light};
        }
        & > ${TreeMain} {
            display: flex;
            flex-flow: row;
            align-items: center;
            &:before {
                content: "";
            }
        }
    }

    ${breakpoint(breakpoints.mobile)} {
        & > ${TreeListItem} > ${TreeMain},
        ${SubTree} ${TreeListItem} {
            &:hover {
                background: ${colors.blue};
            }
        }
    }

`;

export const Outer = styled.div`
    display: flex;
    flex: 1 1 0;
    flex-flow: column-reverse;

    ${breakpoint(breakpoints.tablet)} {
        display: grid;
        grid-template-rows: 1em 500px auto;
        grid-template-columns: auto 500px;
        flex: 1 1 0;
        min-height: 0;
    }
`;

export const Timeline = styled.div`
    width: 100%;
    display: flex;
    flex: 0 0 1em;

    ${breakpoint(breakpoints.tablet)} {
        display: flex;
        grid-row: 1;
        grid-column: span 2;
    }
`;

export const DataItem = styled.span.attrs(({ color }) => ({
    style: { backgroundColor: color },
}))`
    display: block;
    flex-grow: 1;
    height: 100%;
    background-color: ${({ color }) => color};
`;

export const Page = styled(PageBase)`
    flex: 1 1 0;

    ${breakpoint(breakpoints.mobile)} {
        flex-flow: column;

    }

    ${breakpoint(breakpoints.tablet)} {
        min-height: 0;
        flex-flow: column;

        ${Tree} {
            display: flex;
            grid-row: 2 / span 2;
            grid-column: 1;
            flex-flow: column;
            padding: 0;
            min-height: 0;
            min-width: 400px;
            overflow-y: auto;
            overflow-x: hidden;
        }
        ${TreeList} {
            display: flex;
            flex-flow: column;
            min-height: 0;
            flex: 1 1 auto;
            margin: 1em;
        }
    }
`;
