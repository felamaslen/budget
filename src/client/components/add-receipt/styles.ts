import styled from '@emotion/styled';
import { rem } from 'polished';

import { FormField } from '~client/components/form-field/styles';
import { breakpoint } from '~client/styled/mixins';
import { FlexColumn, Flex } from '~client/styled/shared';
import { colors, breakpoints } from '~client/styled/variables';

export const ItemSuggestion = styled.span`
  align-items: center;
  border: 1px solid transparent;
  color: ${colors.light.dark};
  display: inline-flex;
  padding: 0 ${rem(6)};
  z-index: 1;
`;

export const Main = styled(FlexColumn)`
  background: ${colors.white};
  flex: 1;
  overflow: auto;

  label {
    display: flex;
    margin: ${rem(2)} 0 ${rem(6)};
  }

  button {
    flex: 0 0 auto;
  }

  input,
  input::placeholder,
  ${ItemSuggestion} {
    font-family: sans-serif;
    font-size: ${rem(12)} !important;
    letter-spacing: 0;
    line-height: ${rem(12)};
    margin: 0;
  }
  input,
  ${ItemSuggestion} {
    flex: 1;
    margin: 0;
  }
  input {
    border: 1px solid ${colors.medium.mediumDark};
    border-radius: 2px;
    padding: ${rem(1)} ${rem(4)};
    margin: 0 ${rem(2)};
    z-index: 2;
  }

  ${FormField} {
    flex: 0 0 auto;
    margin: 0;
  }

  ${breakpoint(breakpoints.mobile)} {
    justify-content: space-between;
    height: ${rem(500)};
    overflow-y: hidden;

    input[type='number'] {
      width: ${rem(64)};
    }
  }
`;

export const List = styled(FlexColumn)`
  ${breakpoint(breakpoints.mobile)} {
    flex: 1;
    overflow-y: auto;

    input {
      outline: none;
      transition: border-color 0.2s ease;

      &:not(:focus) {
        border-color: transparent;
      }
    }
    input,
    ${ItemSuggestion} {
      text-transform: uppercase;
    }
  }
`;

export const Label = styled.span`
  flex: 0 0 ${rem(100)};
`;

export const ItemCategory = styled(FlexColumn)`
  flex: 1;
  height: ${rem(48)};
`;

export const ItemField = styled.div`
  align-items: center;
  display: inline-flex;
  flex: 0 0 ${rem(24)};
  flex: 1;
  height: 100%;
  position: relative;

  input {
    background: transparent;
  }

  ${FormField}, ${ItemSuggestion} {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
`;

export const CategoryField = styled.div`
  flex: 0 0 ${rem(24)};

  input {
    border-style: dotted;
    border-color: transparent;
    border-bottom-color: ${colors.medium.light};
    font-size: ${rem(12)};
  }
`;

export const CostPage = styled(FlexColumn)``;

export const CreateRow = styled(Flex)`
  justify-content: flex-end;
`;

export const Overview = styled(Flex)`
  width: 100%;
`;

export const TotalCost = styled.div`
  flex: 1;
  text-align: right;
  text-transform: uppercase;
`;
