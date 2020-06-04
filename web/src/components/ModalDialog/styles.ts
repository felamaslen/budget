import styled, { css, keyframes, FlattenSimpleInterpolation } from 'styled-components';
import { colors } from '~client/styled/variables';

const modalEnterState = css`
  transform: perspective(100px) rotateX(5deg) translateZ(-18px);
  opacity: 0;
`;
const modalNormalState = css`
  transform: none;
  opacity: 1;
`;
const modalExitState = modalEnterState;

const intoView = keyframes`
    from {
        ${modalEnterState};
    }
    to {
        ${modalNormalState};
    }
`;

const outOfView = keyframes`
    from {
        ${modalNormalState};
    }
    to {
        ${modalExitState};
    }
`;

export const ModalDialog = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background: ${colors.shadow.light};
`;

export const ModalInner = styled.div<{ active: boolean; isLoading: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  width: 360px;
  max-width: 95%;
  max-height: 95%;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 1.3em;
  background: ${colors.translucent.light.light};
  border-radius: 3px;
  box-shadow: 0 3px 7px ${colors.shadow.light};
  transition: filter 0.1s linear;
  animation: ${intoView} 0.3s ease-out;
  transform-origin: bottom;

  ${({ active }): false | FlattenSimpleInterpolation =>
    !active &&
    css`
      opacity: 0;
      animation: ${outOfView} 0.3s ease-out;
    `};

  ${({ isLoading }): false | FlattenSimpleInterpolation =>
    isLoading &&
    css`
      filter: grayscale(1) contrast(0.7);
    `};
`;

export const Title = styled.span`
  font-size: 1.2em;
  padding: 15px 20px 0 20px;
  display: block;
`;

export const Buttons = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: bottom;
  margin-top: 1em;
  padding: 0 20px 20px 20px;
`;

export const FormList = styled.ul`
  display: flex;
  margin: 1em 0;
  padding: 0 10px;
  list-style: none;
  flex-flow: column nowrap;
`;

export const FormRow = styled.li<{ field: string }>`
  display: flex;
  line-height: 32px;
  flex-flow: ${({ field }): 'row' | 'column' => (field === 'transactions' ? 'column' : 'row')}
    nowrap;
`;

export const FormLabel = styled.span<{ item: string }>`
  flex-basis: 0;
  flex-grow: 1;
  text-transform: capitalize;
  &::after {
    content: ':';
  }

  ${({ item }): false | FlattenSimpleInterpolation =>
    item === 'transactions' &&
    css`
      flex-basis: auto;
    `};
`;

export const FormRowInner = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;
