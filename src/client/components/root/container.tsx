import { useCallback } from 'react';

import { Config } from '~client/components/config';
import { ErrorMessages } from '~client/components/error-messages';
import { Header, Props as HeaderProps } from '~client/components/header';
import { ResizeContext, TodayProvider, useDebouncedResize } from '~client/hooks';
import { GlobalStylesProvider } from '~client/styled/global';
import { PageWrapper } from '~client/styled/shared';
import { useLogoutMutation } from '~client/types/gql';

export const RootContainer: React.FC<Omit<HeaderProps, 'setSettingsOpen'>> = ({
  onLogout,
  children,
  ...props
}) => {
  const windowWidth = useDebouncedResize();

  const [, logoutFromServer] = useLogoutMutation();
  const logout = useCallback(() => {
    logoutFromServer();
    onLogout();
  }, [onLogout, logoutFromServer]);

  return (
    <ResizeContext.Provider value={windowWidth}>
      <TodayProvider>
        <GlobalStylesProvider>
          <Header {...props} onLogout={logout} />
          <ErrorMessages />
          <PageWrapper>
            {children}
            <Config />
          </PageWrapper>
        </GlobalStylesProvider>
      </TodayProvider>
    </ResizeContext.Provider>
  );
};
