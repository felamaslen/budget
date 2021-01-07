import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { Step } from './constants';
import { breakpoint } from '~client/styled/mixins';
import { asButton } from '~client/styled/shared/role';
import { colors, breakpoints } from '~client/styled/variables';

export const FormNavigation = styled.div`
  display: flex;
  flex: 0 0 24px;
  align-items: center;
  justify-content: space-between;
  background: #efefef;

  button {
    margin: ${rem(4)};
  }

  ${breakpoint(breakpoints.mobile)} {
    width: 100%;
    overflow: hidden;

    button {
      height: ${rem(23)};
    }
  }
`;

export const FormContainer = styled.div<{ add: boolean }>(
  ({ add }) => css`
    background: ${colors.white};
    display: flex;
    flex-flow: column;
    flex: 1;
    min-height: 0;

    ${add &&
    css`
      flex: 1 1 0;
      min-height: 0;
      width: 100%;
      position: relative;
      background: ${colors.white as string};
    `};

    ${breakpoint(breakpoints.mobile)} {
      align-items: center;
    }
  `,
);

function stepStyles({ step }: { step?: Step }): SerializedStyles | null {
  if (step && [Step.Assets, Step.Liabilities].includes(step)) {
    return css`
      min-height: 0;
      overflow-y: initial;
    `;
  }
  if (step === Step.Date) {
    return css`
      justify-content: center;
    `;
  }

  return null;
}

export const FormSection = styled.div<{ step?: Step }>`
  display: flex;
  flex-flow: column;
  flex: 1;
  align-items: center;
  overflow-y: auto;
  ${stepStyles};

  ${breakpoint(breakpoints.mobile)} {
    width: ${({ step }): string => (step === Step.Currencies ? 'auto' : '100%')};
  }
`;

export const RequestError = styled.div`
  bottom: ${rem(40)};
  color: #900;
  font-size: ${rem(12)};
  position: absolute;

  ${breakpoint(breakpoints.mobile)} {
    bottom: ${rem(28)};
  }
`;

export const EditByCategory = styled.div`
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const EditByCategoryGroup = styled.div``;

export const EditByCategoryValue = styled.div<{ isLiability: boolean; isOption: boolean }>`
  background: linear-gradient(
    to bottom,
    ${colors.translucent.dark.light as string},
    ${colors.translucent.dark.mediumLight as string}
  );
  display: grid;
  grid-template-columns: ${({ isOption }): string =>
    isOption ? `${rem(64)} auto ${rem(28)}` : `${rem(64)} auto ${rem(104)} ${rem(28)}`};
  grid-template-rows: ${({ isLiability, isOption }): string => {
    if (isLiability) {
      return `${rem(24)} auto ${rem(24)}`;
    }
    if (isOption) {
      return 'auto';
    }
    return `${rem(24)} auto`;
  }};

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    padding: ${rem(5)} 0;
    align-items: flex-start;
  }
`;

export const AddByCategoryValue = styled.div<{ isOption: boolean }>`
  display: grid;
  grid-template-columns: ${({ isOption }): string =>
    isOption ? `auto auto auto ${rem(28)}` : `auto auto ${rem(104)} ${rem(28)}`};
  grid-template-rows: ${rem(24)} auto;
  grid-gap: ${rem(2)};

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    align-items: flex-start;
    padding: ${rem(2)} 0;
  }
`;

export const EditValue = styled.div`
  grid-column: 2;
  grid-row: 1 / span 2;

  ${breakpoint(breakpoints.mobile)} {
    flex: 1;
  }
`;

const AddSection = styled.span`
  display: grid;
  grid-template-rows: inherit;
  grid-row: 1 / span 2;

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    margin: 0 ${rem(10)};
    flex-flow: column;
    flex: 1;
  }
`;

export const AddCategory = styled(AddSection)`
  grid-column: 1;
  grid-row: 2;
`;
export const AddSubcategory = styled(AddSection)<{ isOption: boolean }>`
  grid-column: 1;
  grid-row: 3 / span 2;
`;
export const AddValue = styled.div<{ isOption: boolean }>`
  grid-column: 2;
  grid-row: 2;
`;

export const AddLabel = styled.span`
  font-size: ${rem(12)};
  grid-row: 1;

  ${breakpoint(breakpoints.mobile)} {
    margin-bottom: 3px;
  }
`;

export const SectionTitle = styled.h5`
  margin: ${rem(8)} 0;
  text-align: center;
  font-size: 16px;
`;

export const SectionSubtitle = asButton(styled.h6`
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  outline: none;

  &::after {
    background: ${colors.transparent};
    display: block;
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  ${EditByCategoryGroup} & {
    display: flex;
    align-items: flex-end;
    position: relative;
    height: 26px;
    padding: 0 5px;
    cursor: pointer;

    &:hover,
    &:focus {
      &::after {
        background: ${colors.shadow.light};
      }
    }
    &::before {
      display: inline-block;
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      right: 15px;
      top: ${({ hidden }): number => (hidden ? 10 : 5)}px;
      padding: 2px;
      border-width: 0 3px 3px 0;
      border: solid black;
      border-left-color: transparent;
      border-top-color: transparent;
      transform: rotate(${({ hidden }): number => (hidden ? 225 : 45)}deg);
    }
  }
`);

export const Subcategory = styled.h6`
  ${EditByCategoryGroup} & {
    grid-column: 1;
    grid-row: 1;
    margin: 0;
    padding-top: ${rem(5)};

    ${breakpoint(breakpoints.mobile)} {
      flex: 1;
      margin: 0 ${rem(5)};
    }
  }
`;

export const ValueDelete = styled.div`
  grid-column: 4;
`;

export const CurrencyForm = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
`;

export const EditCurrency = styled.div`
  display: grid;
  grid-gap: ${rem(2)};
  grid-template-columns: ${rem(48)} auto ${rem(24)} ${rem(24)};
  grid-template-rows: ${rem(28)};
`;

export const AddCurrency = styled(EditCurrency)`
  ${FormSection} {
    display: grid;
    grid-column: 1 / span 4;
    grid-gap: inherit;
    grid-template-columns: inherit;
  }

  ${breakpoint(breakpoints.mobile)} {
    ${FormSection} {
      overflow: hidden;
    }
  }
`;

export const CurrencyTitle = styled.h5`
  margin: 0 5px;
  grid-column: 1;

  ${AddCurrency} & {
    width: ${rem(48)};
    input {
      margin-right: ${rem(2)};
      width: 100%;
    }
  }
`;

export const CurrencyInputGroup = styled.div`
  grid-column: 2;
`;

export const CreditLimitEditor = styled.div`
  display: grid;
  font-size: ${rem(12)};
  grid-column: 3;
  grid-row: 1 / span 2;
  white-space: nowrap;

  ${AddByCategoryValue} & {
    grid-row: 2;
  }
`;

export const SkipToggle = styled.div`
  align-items: center;
  display: inline-flex;
  font-size: ${rem(12)};
  grid-row: 3;
  grid-column: 3;
  white-space: nowrap;

  ${AddByCategoryValue} & {
    grid-row: 1;
    grid-column: 1;
  }
`;
