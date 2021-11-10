import { render, RenderResult } from '@testing-library/react';
import { renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import createStore, { MockStore } from 'redux-mock-store';
import { Client } from 'urql';

import { GQLProviderMock, mockClient } from './gql-provider-mock';

import { RootContainer } from '~client/components/root';
import { VOID } from '~client/modules/data';
import type { State } from '~client/reducers';
import { testState } from '~client/test-data';

type RenderWithStoreOptions = {
  customState: Partial<State>;
  customClient: Client;
};

export const VisualProvider: React.FC = ({ children }) => (
  <RootContainer loggedIn={true} onLogout={VOID}>
    {children}
  </RootContainer>
);

export function renderWithStore(
  component: React.ReactElement,
  {
    customState = {},
    customClient = mockClient,
    includeGlobalStyles = false,
    initialRouterEntries = ['/'],
    renderOptions = {},
  }: Partial<
    RenderWithStoreOptions & {
      includeGlobalStyles: boolean;
      initialRouterEntries: string[];
      renderOptions: Partial<RenderResult>;
    }
  > = {},
): RenderResult & { store: MockStore<State> } {
  const store = createStore<State>()({ ...testState, ...customState });

  const renderResult = render(
    <Provider store={store}>
      <GQLProviderMock client={customClient}>
        {includeGlobalStyles ? (
          <MemoryRouter initialEntries={initialRouterEntries}>
            <VisualProvider>{component}</VisualProvider>
          </MemoryRouter>
        ) : (
          component
        )}
      </GQLProviderMock>
    </Provider>,
    renderOptions,
  );

  return { ...renderResult, store };
}

export function renderHookWithStore<TProps, TResult>(
  callback: (props: TProps) => TResult,
  {
    customState = {},
    customClient = mockClient,
    renderHookOptions,
  }: Partial<
    RenderWithStoreOptions & {
      renderHookOptions: RenderHookOptions<TProps>;
    }
  > = {},
): RenderHookResult<TProps, TResult> & { store: MockStore<State> } {
  const store = createStore<State>()({ ...testState, ...customState });

  const CustomWrapper = renderHookOptions?.wrapper as React.FC | undefined;

  const Wrapper: React.FC = ({ children }) => (
    <Provider store={store}>
      <GQLProviderMock client={customClient}>
        {CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}
      </GQLProviderMock>
    </Provider>
  );

  const renderHookResult = renderHook(callback, {
    ...renderHookOptions,
    wrapper: Wrapper,
  });

  return { ...renderHookResult, store };
}

export function hookRendererWithStore<TProps, TResult>(
  callback: (props: TProps) => TResult,
  {
    customClient = mockClient,
    renderHookOptions,
  }: Partial<
    RenderWithStoreOptions & {
      renderHookOptions: RenderHookOptions<TProps>;
    }
  > = {},
): {
  render: (customState?: Partial<State>) => RenderHookResult<TProps, TResult>;
  getStore: () => MockStore<State>;
} {
  let store: MockStore<State>;
  const CustomWrapper = renderHookOptions?.wrapper as React.FC | undefined;

  const Wrapper: React.FC = ({ children }) => (
    <Provider store={store}>
      <GQLProviderMock client={customClient}>
        {CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}
      </GQLProviderMock>
    </Provider>
  );

  let renderHookResult: RenderHookResult<TProps, TResult> | undefined;

  return {
    render: (customState): RenderHookResult<TProps, TResult> => {
      store = createStore<State>()({ ...testState, ...customState });
      if (renderHookResult) {
        renderHookResult.rerender();
      } else {
        renderHookResult = renderHook(callback, { ...renderHookOptions, wrapper: Wrapper });
      }
      return renderHookResult;
    },
    getStore: (): MockStore<State> => store,
  };
}
