import styled from 'styled-components';
import { CategoryList } from '~client/components/NetWorthCategoryList/styles';

export const SubcategoryList = styled.div`
    display: grid;
    grid-template-rows: 28px auto;
    grid-template-columns: auto 100px 100px 64px 64px;

    ${CategoryList} & {
        grid-row: 2;
        grid-column: 1 / span 3;
    }
`;

export const ItemForm = styled.span`
    display: grid;
    margin: 0;
    padding: 0.4em 0;
    grid-template-columns: auto 100px 100px 64px 64px;
`;

export const ListHead = styled.div`
    display: grid;
    grid-template-columns: inherit;
    grid-row: 1;
    grid-column: 1 / span 5;
    font-weight: bold;
    text-align: center;
    span {
        display: flex;
        align-items: center;
    }
`;

export const Name = styled.span`
    margin: 0 2em;
    grid-column: 1;
`;

export const CreditLimit = styled.span`
    display: flex;
    justify-content: center;
    grid-column: 2;
`;

export const Opacity = styled.span`
    grid-column: 3;
`;

export const ButtonChange = styled.div`
    grid-column: 4;
`;
