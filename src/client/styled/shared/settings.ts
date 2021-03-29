import styled from '@emotion/styled';
import { rem } from 'polished';

import { FlexCenter, FlexColumn, InlineFlexCenter } from './layout';

import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const SettingsBackground = styled.div`
  background: ${colors.shadow.mediumLight};
  content: '';
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 11;

  ${breakpoint(breakpoints.mobile)} {
    display: none;
  }
`;

export const SettingsDialog = styled(FlexColumn)`
  align-items: center;
  background: ${colors.translucent.light.light};
  border-radius: ${rem(6)};
  display: flex;
  left: 50%;
  justify-content: space-around;
  padding: ${rem(10)} ${rem(5)};
  position: fixed;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: ${rem(190)};
  z-index: 12;
`;

export const SettingsGroup = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: 40% 60%;
  margin-bottom: ${rem(4)};
  padding: ${rem(4)} ${rem(4)};
  width: 100%;

  ${breakpoint(breakpoints.mobile)} {
    display: inline;
    flex: 0 0 auto;
    margin: 0;
    padding: 0;
    width: auto;
  }
`;

export const SettingsInput = styled(FlexCenter)`
  grid-column: 2;
  text-align: left;

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
  }
`;

export const SettingsLabel = styled(InlineFlexCenter)`
  grid-column: 1;

  ${breakpoint(breakpoints.mobile)} {
    display: none;
  }
`;

export const SettingsFull = styled(FlexCenter)`
  grid-column: 1 / span 2;
`;
