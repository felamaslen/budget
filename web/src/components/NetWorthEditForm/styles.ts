import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { Step } from './constants';
import { rem } from '~client/styled/mixins';
import { colors } from '~client/styled/variables';

export const FormNavigation = styled.div`
  display: flex;
  flex: 0 0 24px;
  align-items: center;
  justify-content: space-between;
  background: #efefef;

  button {
    height: 23px;
  }
`;

export const FormContainer = styled.div<{ add: boolean }>`
  display: flex;
  flex-flow: column;
  flex: 1;
  min-height: 0;

  ${({ add }): false | FlattenSimpleInterpolation =>
    add &&
    css`
      flex: 1 1 0;
      min-height: 0;
      width: 100%;
      position: relative;
      background: ${colors.white as string};
    `};
`;

function stepStyles({ step }: { step?: Step }): FlattenSimpleInterpolation | null {
  if (step === Step.Values) {
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

export const FormSection = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  align-items: center;
  overflow-y: auto;
  ${stepStyles};
`;

export const Error = styled.div`
  color: #900;
  font-size: 12px;
`;

export const EditByCategory = styled.div`
  width: 100%;
  overflow-y: auto;
`;

export const EditByCategoryGroup = styled.div``;

export const EditByCategoryValue = styled.div`
  display: flex;
  padding: 5px 0;
  align-items: flex-start;
  background: linear-gradient(
    to bottom,
    ${colors['translucent-l2'] as string},
    ${colors['translucent-l1'] as string}
  );
`;

export const AddByCategoryValue = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 2px 0;
`;

const AddSection = styled.span`
  display: flex;
  margin: 0 10px;
  flex-flow: column;
  flex: 1;
`;

export const AddCategory = styled(AddSection)``;
export const AddSubcategory = styled(AddSection)``;

export const AddLabel = styled.span`
  margin-bottom: 3px;
  font-size: 12px;
`;

export const SectionTitle = styled.h5`
  margin: ${rem(8)} 0;
  text-align: center;
  font-size: 16px;
`;

export const SectionSubtitle = styled.h6`
  margin: 0;
  font-size: 14px;
  line-height: 24px;

  ${EditByCategoryGroup} & {
    display: flex;
    align-items: flex-end;
    position: relative;
    height: 26px;
    padding: 0 5px;
    cursor: pointer;

    &:hover {
      &::after {
        display: block;
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.25);
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
`;

export const Subcategory = styled.h6`
  ${EditByCategoryGroup} & {
    margin: 0 5px;
    flex: 1;
    padding-top: 5px;
  }
`;

export const currencyTitleWidth = 100;

export const EditCurrency = styled.div`
  display: flex;
  align-items: center;
`;

export const AddCurrency = styled(EditCurrency)`
  flex-flow: column;
  align-items: flex-start;

  ${FormSection} {
    display: flex;
    flex-flow: row;
  }
`;

export const CurrencyTitle = styled.h5`
  margin: 0 5px;
  flex: 0 0 ${currencyTitleWidth}px;

  ${AddCurrency} & {
    flex: 0 0 auto;
  }
`;

export const CurrencyInputGroup = styled.div``;
