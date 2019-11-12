import styled from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { CategoryItemForm } from '~client/components/NetWorthCategoryList/styles';
import { FormColor } from '~client/components/FormField/styles';
import { ButtonDelete } from '~client/components/ListRowDesktop/styles';
import { ButtonAdd } from '~client/components/ListFootMobile/styles';

export const Button = styled.button`
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

    ${ButtonDelete} & {
        width: 18px !important;
        height: 18px !important;
        line-height: 18px !important;
    }

    ${ButtonAdd} & {
        width: 120px;
        flex-grow: 0;
        background: ${colors.primaryDarkMobile};
        color: ${colors.white};
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
`;
