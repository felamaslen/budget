import { render, RenderResult } from '@testing-library/react';
import { renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react-hooks';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import { Client } from 'urql';

import { GQLProviderMock, mockClient } from './gql-provider-mock';

import type { State } from '~client/reducers';
import { GlobalStylesProvider } from '~client/styled/global';
import { testState } from '~client/test-data';

type RenderWithStoreOptions = {
  customState: Partial<State>;
  customClient: Client;
};

export function renderWithStore(
  component: React.ReactElement,
  {
    customState = {},
    customClient = mockClient,
    renderOptions = {},
  }: Partial<
    RenderWithStoreOptions & {
      renderOptions: Partial<RenderResult>;
    }
  > = {},
): RenderResult & { store: MockStore<State> } {
  const store = createStore<State>()({ ...testState, ...customState });

  const renderResult = render(
    <Provider store={store}>
      <GQLProviderMock client={customClient}>
        <GlobalStylesProvider>{component}</GlobalStylesProvider>
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
