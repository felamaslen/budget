import styled from '@emotion/styled';
import { rem } from 'polished';

import { FlexCenter, FlexColumn, InlineFlexCenter } from './layout';

import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const SettingsBackgroundModal = styled.div`
  background: ${colors.shadow.mediumLight};
  content: '';
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
`;

export const SettingsBackground = styled(SettingsBackgroundModal)`
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
  width: ${rem(230)};
  z-index: 101;

  h3 {
    font-size: ${rem(16)};
    margin: ${rem(4)} 0 ${rem(8)} 0;
  }
`;

export const SettingsGuild = styled.div`
  margin: ${rem(4)} 0;
  padding: ${rem(4)};
  width: 100%;

  &:not(:first-of-type) {
    border-top: 1px solid ${colors.light.mediumDark};
  }
`;

export const SettingsGroupModal = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: 40% 60%;
  margin-bottom: ${rem(4)};
  padding: ${rem(4)} ${rem(4)};
  width: 100%;
`;

export const SettingsGroup = styled(SettingsGroupModal)`
  ${breakpoint(breakpoints.mobile)} {
    display: inline;
    flex: 0 0 auto;
    margin: 0 0 ${rem(4)} 0;
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

export const SettingsLabelModal = styled(InlineFlexCenter)`
  font-size: ${rem(13)};
  grid-column: 1;
  justify-content: flex-start;
`;

export const SettingsLabel = styled(SettingsLabelModal)`
  ${breakpoint(breakpoints.mobile)} {
    display: none;
  }
`;

export const SettingsFull = styled(FlexCenter)`
  grid-column: 1 / span 2;
`;
