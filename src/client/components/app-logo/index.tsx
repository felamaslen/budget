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

export const AppLogoIcon: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={45} fill={colors.white} />
    <g fill={colors.primaryDark} fillRule="evenodd">
      <path
        d={[
          'M50,8',
          'c14,0 25,10 25,20',
          'c0,10 -14,10 -14,0',
          'c0,-20 -20,-20 -12,5',
          'c3,10 3,12 4,14',
          'h15',
          'v6',
          'h-14',
          'c2,8 -3,18 -4,18',
          'c10,3 18,8 25,-5',
          'c0,20 -23,24 -31,15',
          'c-22,24 -32,-22 -1,-13',
          'c1,-5 -2,-10 -4,-15',
          'h-10',
          'v-6',
          'h8',
          'c-6,-10 -12,-39 13,-39',
          'M40,78',
          'c-12,16 -20,-4 -6,-4',
          'c5,0 6,4 6,4',
        ].join(' ')}
      />
    </g>
  </svg>
);

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
          <Styled.AppLogoIcon>
            <AppLogoIcon />
          </Styled.AppLogoIcon>
          <Styled.Title>
            <span>Budget</span>
          </Styled.Title>
          <Styled.SettingsButton {...logoEvents}>⚙</Styled.SettingsButton>
        </Styled.TitleContainer>
      </Styled.Logo>
    </Styled.AppLogo>
  );
};
