import { darken } from 'polished';
import styled from 'styled-components';
import { rem } from '~client/styled/mixins';
import { colors } from '~client/styled/variables';

export const fieldSizesMobile = {
  date: `0 0 ${rem(104)}`,
  item: '1',
  cost: `0 0 ${rem(80)}`,
};

export const StandardFieldMobile = styled.span<{
  field: string;
}>`
  flex: ${({ field }): string => Reflect.get(fieldSizesMobile, field) ?? '1'};
  overflow: hidden;
  padding-right: ${rem(4)};
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MobileCreateForm = styled.div<{
  bgColor?: string;
}>`
  align-items: center;
  background: ${colors['translucent-l8']};
  bottom: 0;
  display: flex;
  flex-flow: column;
  height: ${rem(48)};
  justify-content: center;
  position: absolute;
  width: 100%;

  button {
    align-items: center;
    background: ${({ bgColor = colors.white }): string => darken(0.5)(bgColor)};
    border: none;
    border-radius: ${rem(2)};
    color: ${colors.white};
    font-size: ${rem(14)};
    flex: 0 0 ${rem(42)};
    justify-content: center;
    line-height: ${rem(40)};
    padding: 0;
    margin: 0;
    text-transform: uppercase;
    width: ${rem(128)};
  }
`;

export const MobileRow = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  display: flex;
  flex: 1;
  font: inherit;
  height: inherit;
  overflow: hidden;
  margin: 0;
  padding: 0;
`;
