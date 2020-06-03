import styled, { css } from 'styled-components';
import { CategoryList } from '~client/components/NetWorthCategoryList/styles';
import { breakpoint, rem } from '~client/styled/mixins';
import { InlineFlexCenter } from '~client/styled/shared/layout';
import { breakpoints } from '~client/styled/variables';

const subcategoryGridColumns = css`auto ${rem(100)} ${rem(100)} ${rem(72)} ${rem(24)}`;

const subcategoryGridColumnsMobile = css`auto ${rem(24)}`;

export const SubcategoryList = styled.div`
  display: grid;
  grid-template-columns: ${subcategoryGridColumnsMobile};
  grid-template-rows: auto;

  ${breakpoint(breakpoints.mobile)} {
    grid-template-columns: ${subcategoryGridColumns};
    grid-template-rows: ${rem(28)} auto;

    ${CategoryList} & {
      grid-column: 2;
      grid-row: 2;
    }
  }
`;

const SubGrid = styled.div`
  display: grid;
  grid-template-columns: ${subcategoryGridColumnsMobile};
  grid-template-rows: ${rem(28)};

  ${breakpoint(breakpoints.mobile)} {
    grid-template-columns: ${subcategoryGridColumns};

    span {
      display: flex;
      align-items: center;
    }
  }
`;

export const ItemForm = styled(SubGrid)`
  grid-template-rows: repeat(4, ${rem(28)});
  margin: 0;
  padding: ${rem(4)} 0;

  ${breakpoint(breakpoints.mobile)} {
    grid-template-rows: ${rem(28)};
  }
`;

export const ListHead = styled(SubGrid)`
  display: none;
  font-weight: bold;
  grid-row: 1;
  grid-column: 1 / span 5;
  text-align: center;

  ${breakpoint(breakpoints.mobile)} {
    display: grid;
  }
`;

const ItemRow = styled.span`
  display: grid;
  grid-column: 1;
  grid-row: 1;
  grid-template-columns: ${rem(96)} auto;

  &::before {
    font-size: ${rem(14)};
    grid-column: 1;
    white-space: nowrap;
  }
  input {
    grid-column: 2;
  }

  ${breakpoint(breakpoints.mobile)} {
    display: inline;
    margin: 0 ${rem(4)};

    &::before {
      content: none !important;
    }
  }
`;

export const Name = styled(ItemRow)`
  &::before {
    content: 'Name';
  }
  input {
    width: 100%;
  }

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 1;
    grid-row: 1;
  }
`;

export const CreditLimit = styled(ItemRow)`
  grid-row: 3;

  &::before {
    content: 'Credit limit';
  }

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 2;
    grid-row: 1;
    text-align: center;
  }
`;

export const Opacity = styled(ItemRow)`
  grid-row: 2;

  &::before {
    content: 'Opacity';
  }

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 3;
    grid-row: 1;
    padding: 0 ${rem(4)};

    input {
      width: 100%;
    }
  }
`;

export const ButtonChange = styled.div`
  grid-column: 1;
  grid-row: 4;
  margin-left: auto;

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 4;
    margin-left: 0;
    margin-right: ${rem(4)};
  }
`;

export const ButtonDeleteContainer = styled(InlineFlexCenter)`
  grid-column: 2;
  grid-row: 1;

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 5;
  }
`;
