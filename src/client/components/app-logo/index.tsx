import { css, SerializedStyles } from '@emotion/react';
import { rem } from 'polished';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import DotLoader from 'react-spinners/DotLoader';

import * as Styled from './styles';

import { settingsToggled } from '~client/actions';
import { useCTA } from '~client/hooks';
import { colors } from '~client/styled/variables';

export type Props = { loading: boolean };

const spinnerOverride = (loading: boolean): SerializedStyles => css`
  flex: 0 0 ${rem(22)};
  opacity: ${loading ? 1 : 0};
  position: absolute;
  right: 0;
  transition: opacity 0.5s ease;
`;

export const AppLogo: React.FC<Props> = ({ loading }) => {
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState<boolean>(loading);
  const timer = useRef<number>(0);
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    } else {
      timer.current = window.setTimeout(() => setShowLoading(false), 500);
    }
    return (): void => clearTimeout(timer.current);
  }, [loading]);

  const openSettingsDialog = useCallback(() => dispatch(settingsToggled(true)), [dispatch]);
  const logoEvents = useCTA(openSettingsDialog);

  return (
    <Styled.AppLogo>
      <Styled.Loader>
        <DotLoader
          loading={loading || showLoading}
          color={colors.amber}
          css={spinnerOverride(loading)}
          size={22}
        />
      </Styled.Loader>
      <Styled.Logo>
        <Styled.TitleContainer>
          <Styled.Title>
            <span>Budget</span>
          </Styled.Title>
          <Styled.SettingsButton {...logoEvents}>⚙</Styled.SettingsButton>
        </Styled.TitleContainer>
      </Styled.Logo>
    </Styled.AppLogo>
  );
};
