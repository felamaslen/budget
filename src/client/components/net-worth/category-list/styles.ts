import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { InlineFlexCenter } from '~client/styled/shared/layout';
import { colors, breakpoints } from '~client/styled/variables';

const categoryItemHeight = 52;

export const CategoryList = styled.div`
  display: flex;
  flex-flow: column;
  user-select: none;
  min-height: 0;
  max-height: 720px;
`;

export const CategoryItem = styled.div`
  margin: 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.medium.mediumLight};
  }

  ${breakpoint(breakpoints.mobile)} {
    display: grid;
    grid-template-rows: ${categoryItemHeight}px auto;
    grid-template-columns: ${rem(24)} auto ${rem(24)};
    grid-gap: 5px;
  }
`;

export const CategoryItemMain = styled.div`
  display: grid;
  grid-gap: ${rem(4)};
  grid-template-rows: ${rem(48)};
  grid-template-columns: ${rem(24)} auto ${rem(24)};

  ${breakpoint(breakpoints.mobile)} {
    grid-template-columns: inherit;
    grid-gap: inherit;
    grid-row: 1;
    grid-column: 1 / span 3;
  }
`;

const CategorySection = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  padding-left: ${rem(4)};
`;

export const CategoryInput = styled(CategorySection)`
  grid-column: 1 / span 2;
  grid-row: 1;

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 2;
  }
`;

export const CategoryType = styled(CategorySection)`
  grid-column: 1;
  grid-row: 2;

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 1;
    grid-row: 1;
  }
`;

export const CategoryColor = styled(CategorySection)`
  grid-column: 2;
  grid-row: 2;

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 3;
    grid-row: 1;
  }
`;

export const CategoryButton = styled.div`
  grid-column: 3;
  grid-row: 1 / span 2;

  ${breakpoint(breakpoints.mobile)} {
    grid-column: 4;
    grid-row: 1;
    margin-left: ${rem(4)};
  }
`;

export const CategoryItemForm = styled.span`
  display: grid;
  align-items: center;
  grid-column: 2;
  grid-row: 1;
  grid-template-rows: repeat(2, ${rem(24)});
  grid-template-columns: ${rem(100)} auto ${rem(48)};
  overflow-x: hidden;

  ${breakpoint(breakpoints.mobile)} {
    grid-row: 1;
    grid-column: 2;
    grid-template-rows: ${categoryItemHeight}px;
    grid-template-columns: ${rem(72)} auto ${rem(56)} ${rem(72)};
  }
`;

export const ToggleVisibility = styled.div`
  align-items: center;
  display: flex;
  grid-row: 1;
  grid-column: 1;
  justify-content: center;
`;

export const ButtonDeleteContainer = styled(InlineFlexCenter)`
  grid-column: 3;
  grid-row: 1;
`;
