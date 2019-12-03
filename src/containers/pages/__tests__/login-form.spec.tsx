import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import LoginForm from '~/containers/pages/login-form';
import { loginRequested } from '~/actions/login';
import { PreloadedState } from '~/reducers';

afterEach(cleanup);

const mockStore = createMockStore<PreloadedState>([]);

test('The page is not rendered if logged in', () => {
  const state: PreloadedState = {
    login: {
      loading: false,
      uid: 'some-user-id',
      name: 'Some name',
      token: 'some-token',
    },
  };

  const store = mockStore(state);
  const { container } = render(
    <Provider store={store}>
      <LoginForm />
    </Provider>,
  );

  expect(container.childNodes).toHaveLength(0);
});

test('Entering a four digit pin triggers a login action', () => {
  const state: PreloadedState = {
    login: {
      loading: false,
    },
  };

  const store = mockStore(state);
  const { container } = render(
    <Provider store={store}>
      <LoginForm />
    </Provider>,
  );

  expect(store.getActions()).toHaveLength(0);

  expect(container.childNodes.length).toBeGreaterThan(0);

  fireEvent.keyDown(document.body, { key: '1' });
  expect(store.getActions()).toHaveLength(0);
  fireEvent.keyDown(document.body, { key: '2' });
  expect(store.getActions()).toHaveLength(0);
  fireEvent.keyDown(document.body, { key: '3' });
  expect(store.getActions()).toHaveLength(0);

  fireEvent.keyDown(document.body, { key: '4' });
  expect(store.getActions()).toHaveLength(1);
  expect(store.getActions()[0]).toStrictEqual(loginRequested('1234'));
});
