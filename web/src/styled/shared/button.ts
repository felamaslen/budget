import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { CategoryItemForm, ToggleVisibility } from '~client/components/NetWorthCategoryList/styles';
import { CrudList } from '~client/components/CrudList/styles';
import {
  centerGridOne,
  FormColor,
  NetWorthValueComplex,
} from '~client/components/FormField/styles';
import { ButtonDelete as RowButtonDelete } from '~client/components/ListRowDesktop/styles';
import { ButtonAdd as MobileButtonAdd } from '~client/components/ListFootMobile/styles';
import { ButtonDelete as NetWorthEntryDelete } from '~client/components/NetWorthList/styles';
import {
  EditCurrency,
  EditByCategory,
  AddByCategoryValue,
} from '~client/components/NetWorthEditForm/styles';
import { ModalDialog } from '~client/components/ModalDialog/styles';

export const Button = styled.button<{
  expanded?: boolean;
}>`
  display: flex;
  margin: 0 6px;
  flex-grow: 1;
  justify-content: center;
  padding: 1em 0;
  width: 100%;
  background: ${colors.button.mobile};
  font-size: 0.6em;
  border: none;
  border-radius: 3px;
  outline: none;
  text-transform: uppercase;
  font-weight: bold;

  ${RowButtonDelete} & {
    width: 18px;
    height: 18px;
    line-height: 18px;
  }

  ${MobileButtonAdd} & {
    width: 120px;
    flex-grow: 0;
    background: ${colors.primaryDarkMobile};
    color: ${colors.white};
  }

  ${CategoryItemForm} & {
    ${centerGridOne};
    grid-column: 4;
  }

  ${ToggleVisibility} & {
    &,
    &:hover,
    &:active {
      background: none;
      border: none;
      box-shadow: none;
    }

    &::after {
      display: block;
      margin-left: 16px;
      content: '';
      width: 0;
      height: 0;
      border: solid transparent;
      border-left-color: ${colors['very-dark']};
      border-width: 6px 8px;
      transform-origin: left center;
      ${({ expanded = false }): false | FlattenSimpleInterpolation =>
        expanded &&
        css`
          transform: rotate(90deg);
        `};
    }
  }

  &:disabled {
    background: none;
  }

  ${breakpoint(breakpoints.mobile)} {
    display: inline-block;
    margin: 0;
    padding: 5px 12px 6px;
    flex-grow: 0;
    width: auto;
    box-shadow: inset 0px 1px 0px 0px ${colors.button.shadow};
    background: linear-gradient(to bottom, ${colors.button.bg2} 5%, ${colors.button.bg1} 100%);
    background-color: ${colors.button.bg2};
    border: 1px solid ${colors.button.border};
    border-radius: 0;
    cursor: pointer;
    color: ${colors.white};
    font-family: Arial;
    font-size: 13px;
    height: 24px;
    position: relative;
    text-decoration: none;
    text-transform: none;
    z-index: 4;

    &:hover {
      background-color: ${colors.button.bg1};
      background-image: linear-gradient(
        to bottom,
        ${colors.button.bg1} 5%,
        ${colors.button.bg2} 100%
      );
    }
    &:active {
      top: 1px;
      background: $color-button-active;
    }
    &:focus {
      box-shadow: 0 2px 3px ${colors['shadow-l3']};
    }
    &:disabled {
      background: ${colors.button.disabled};
      cursor: default;
      border: 1px solid ${colors['medium-slightly-dark']};
    }
  }

  ${CategoryItemForm} ${FormColor} & {
    display: flex;
    padding: 0.1em 1em;
    align-items: center;
    top: 0;
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    cursor: pointer;
    background: ${colors['shadow-l3']};
    border: none;
    box-shadow: none;
  }

  ${EditCurrency} & {
    margin: 2px 4px;
    width: 32px;
    height: 22px;
    line-height: 16px;
  }
`;

export const ButtonCrud = styled(Button)`
    ${NetWorthValueComplex} & {
        margin: 0 3px;
        top: 0;
        flex: 0 0 auto;
        width: 32px;
    }
    ${AddByCategoryValue} &,
    ${EditByCategory} & {
        margin: 0 5px;
        flex: 0 0 auto;
    }
`;

export const ButtonDelete = styled(ButtonCrud)`
  ${CrudList} & {
    display: inline-flex;
    margin: 0;
    padding: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 18px;
    line-height: 22px;
    background: ${colors.delete};
    border-radius: 100%;
    border: none;
    box-shadow: none;
  }
  ${CategoryItemForm} > & {
    grid-row: 1;
    grid-column: 3;
  }
  ${NetWorthEntryDelete} & {
    width: 16px;
    height: 16px;
    font-size: 16px;
    line-height: 16px;
  }
`;

export const ButtonAdd = styled(ButtonCrud)``;

export const ButtonCancel = styled(Button)`
  ${ModalDialog} & {
    background: ${colors['slightly-light']};
    color: ${colors.black};
    &::after {
      display: block;
      content: '';
      height: 100%;
      width: 0;
      border-right: 1px solid ${colors['medium-very-light']};
    }
  }
  ${breakpoint(breakpoints.mobile)} {
    position: absolute;
    left: 0;
    top: 0;
  }
`;

export const ButtonRefresh = styled(Button)``;

export const ButtonSubmit = styled(Button)`
  ${ModalDialog} & {
    background: ${colors.blue};
    color: ${colors.white};
  }
`;
