import styled, { css } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { ModalDialog } from '~client/components/ModalDialog/styles';
import { Row as ListRowDesktop } from '~client/components/ListRowDesktop/styles';
import { RowCreate } from '~client/components/ListCreateDesktop/styles';
import {
    EditByCategory,
    AddByCategoryValue,
    AddCurrency,
    currencyTitleWidth,
} from '~client/components/NetWorthEditForm/styles';
import { SubcategoryList as NetWorthSubcategoryList } from '~client/components/NetWorthSubcategoryList/styles';

export const FormField = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        opacity: ${({ small, active }) => (small && !active ? 0.3 : 1)};
    }

    ${({ small }) =>
        small &&
        css`
            &,
            input {
                width: 100px;
            }
        `}

    ${({ item }) =>
        item === 'text' &&
        css`
            ${AddCurrency} & {
                margin: 0 5px;
                flex: 0 0 ${currencyTitleWidth}px;
                input {
                    margin: 0;
                    padding-left: 0;
                    padding-right: 0;
                    width: ${currencyTitleWidth - 4}px;
                }
            }
        `}

${NetWorthSubcategoryList} & {
    ${({ item }) => {
        if (item === 'subcategory') {
            return css`
                margin: 0 2em;
                padding: 0 0.5em;
                grid-column: 1;
            `;
        }
        if (item === 'credit-limit') {
            return css`
                margin: auto;
                grid-column: 2;
            `;
        }
        if (item === 'opacity') {
            return css`
                margin: 0 1em;
                grid-column: 3;

                input {
                    width: 100%;
                }
            `;
        }

        return null;
    }};
}
`;

export const FormColor = styled.div``;

const transactionsWidthDate = 110;
const transactionsWidthUnits = 60;
const transactionsWidthCost = 60;

export const TransactionsModal = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        padding: 2px 1px 4px 1px;
        position: absolute;
        top: 0;
        z-index: 2;
        background: ${colors['translucent-l8']};
        box-shadow: 0 2px 6px ${colors['shadow-l2']};

        ${ListRowDesktop}:nth-last-child(-n + 3) & {
            top: initial;
            bottom: 0;
        }

        ${RowCreate} & {
            top: 0 !important;
            bottom: initial !important;
        }
    }
`;

export const ModalInner = styled.div``;

export const ModalHead = styled.div`
    ${breakpoint(breakpoints.mobile)} {
        display: flex;
        line-height: 24px;
        font-weight: bold;
        font-size: 14px;
    }
`;

export const TransactionsList = styled.ul`
    ${breakpoint(breakpoints.mobile)} {
        display: flex;
        margin: 0;
        padding: 0;
        flex-flow: column;
        list-style: none;
        max-height: 130px;
        overflow-y: auto;
    }
`;

export const TransactionsListItem = styled.li`
    ${ModalDialog} & {
        flex-flow: column !important;
    }

    ${breakpoint(breakpoints.mobile)} {
        display: flex;
        align-items: center;
        line-height: 24px;
        flex: 0 0 24px;

        input {
            padding: 0 0 0 1px !important;
            font-size: 12px !important;
            height: 22px !important;
            line-height: 22px !important;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
        }
    }
`;

export const TransactionCol = styled.span`
    ${breakpoint(breakpoints.mbile)} {
        display: block;
    }
`;
export const TransactionLabel = styled(TransactionCol)`
    ${breakpoint(breakpoints.mobile)} {
        display: none;
    }
`;

export const ModalHeadColumn = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        margin-left: 0;
        text-align: left;
    }
`;

const transactionItem = width => css`
    ${breakpoint(breakpoints.mobile)} {
        flex: 0 0 ${width}px !important;

        &,
        ${TransactionCol}, input {
            width: ${width}px !important;
        }
    }
`;

export const TransactionRow = styled.span`
    ${breakpoint(breakpoints.mobile)} {
        margin: 0;
    }
`;

export const TransactionRowButton = styled(TransactionRow)`
    ${breakpoint(breakpoints.mobile)} {
        button {
            margin-top: 3px;
        }
    }
`;

export const TransactionRowDate = styled(TransactionRow)`
    ${transactionItem(transactionsWidthDate)};
`;
export const TransactionRowUnits = styled(TransactionRow)`
    ${transactionItem(transactionsWidthUnits)};
`;
export const TransactionRowCost = styled(TransactionRow)`
    ${transactionItem(transactionsWidthCost)};
`;

export const ModalHeadDate = styled(ModalHeadColumn)`
    ${transactionItem(transactionsWidthDate)};
`;
export const ModalHeadUnits = styled(ModalHeadColumn)`
    ${transactionItem(transactionsWidthUnits)};
`;
export const ModalHeadCost = styled(ModalHeadColumn)`
    ${transactionItem(transactionsWidthCost)};
`;

export const NumTransactions = styled.span`
    ${ModalDialog} & {
        display: none;
    }
    ${breakpoint(breakpoints.mobile)} {
        ${({ active }) =>
            active &&
            css`
                z-index: 1;
            `}
    }
`;

export const NetWorthValue = styled.div`
    display: flex;
    flex-flow: column;
    align-items: flex-start;

    ${EditByCategory} & {
        flex: 3;
    }
    ${AddByCategoryValue} & {
        margin: 0 10px;
        flex: 2;
    }
`;

export const NetWorthValueComplexToggle = styled.span`
    display: inline-flex;
    align-items: center;
    margin-right: 6px;
    font-size: 12px;
`;

export const NetWorthValueList = styled.ul`
    margin: 0 6px 0 0;
    padding: 0;
    flex: 1;
    list-style: none;
`;

export const NetWorthValueComplex = styled.li`
    display: flex;
    select {
        flex: 0 0 60px;
    }

    ${({ add }) =>
        add &&
        css`
            margin-top: 3px;
            padding: 3px 0;
            background: rgba(200, 200, 200, 0.3);
        `}

    ${FormField} {
        flex: 0 0 64px;
        input {
            width: 64px;
        }
    }
`;
