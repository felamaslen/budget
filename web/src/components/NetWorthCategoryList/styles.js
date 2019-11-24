import styled from 'styled-components';
import { colors } from '~client/styled/variables';

const categoryItemHeight = 52;

export const CategoryList = styled.div`
    display: flex;
    flex-flow: column;
    user-select: none;
    min-height: 0;
    max-height: 720px;
`;

export const CategoryItem = styled.div`
    display: grid;
    margin: 0;
    grid-template-rows: ${categoryItemHeight}px auto;
    grid-template-columns: 24px auto 28px;
    grid-gap: 5px;

    &:not(:last-child) {
        border-bottom: 1px solid ${colors.medium};
    }
`;

export const CategoryItemMain = styled.div`
    display: grid;
    grid-template-columns: inherit;
    grid-gap: inherit;
    grid-row: 1;
    grid-column: 1 / span 3;
`;

export const CategoryItemForm = styled.span`
    display: grid;
    align-items: center;
    grid-row: 1;
    grid-column: 2;
    grid-template-rows: ${categoryItemHeight}px;
    grid-template-columns: 104px auto 150px 64px;

    .color-picker {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        z-index: 5;
    }
`;

export const ToggleVisibility = styled.div`
    display: flex;
    grid-row: 1;
    grid-column: 1;
    align-items: center;
    justify-content: center;
`;
