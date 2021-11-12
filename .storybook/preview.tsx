import { DecoratorFn } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { createStore } from '../src/client/store/configureStore.prod';
import { GlobalStylesProvider } from '../src/client/styled/global';
import { testState } from '../src/client/test-data';

const store = createStore(testState);

export const decorators: DecoratorFn[] = [
  (Story) => (
    <MemoryRouter initialEntries={['/']}>
      <Story />
    </MemoryRouter>
  ),
  (Story) => (
    <Provider store={store}>
      <Story />
    </Provider>
  ),
  (Story) => (
    <GlobalStylesProvider>
      <Story />
    </GlobalStylesProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
};
