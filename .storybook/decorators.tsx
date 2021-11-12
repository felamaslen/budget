import { DecoratorFn } from '@storybook/react';
import { endOfDay } from 'date-fns';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { Client } from 'urql';

import { RootContainer } from '~client/components/root/container';
import { ResizeContext, TodayContext } from '~client/hooks';
import { VOID } from '~client/modules/data';
import { createStore } from '~client/store/configureStore.prod';
import { GlobalStylesProvider } from '~client/styled/global';
import { testState } from '~client/test-data';
import { GQLProviderMock } from '~client/test-utils';

export const router =
  (initialEntries: string[] = ['/']): DecoratorFn =>
  (Story) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Story />
      </MemoryRouter>
    );

const store = createStore(testState);

export const gql =
  (client?: Client): DecoratorFn =>
  (Story) =>
    (
      <GQLProviderMock client={client}>
        <Story />
      </GQLProviderMock>
    );

export const redux: DecoratorFn = (Story) => (
  <Provider store={store}>
    <Story />
  </Provider>
);

export const mockToday =
  (now: Date): DecoratorFn =>
  (Story) =>
    (
      <TodayContext.Provider value={endOfDay(now)}>
        <Story />
      </TodayContext.Provider>
    );

export const mockWindowWidth =
  (width = 1024): DecoratorFn =>
  (Story) =>
    (
      <ResizeContext.Provider value={width}>
        <Story />
      </ResizeContext.Provider>
    );

export const styles: DecoratorFn = (Story) => (
  <GlobalStylesProvider>
    <Story />
  </GlobalStylesProvider>
);

export const fullVisual: DecoratorFn = (Story) => (
  <RootContainer loggedIn={true} onLogout={VOID}>
    <Story />
  </RootContainer>
);
