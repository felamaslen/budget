import { RouterState } from 'connected-react-router';
import { getCurrentPathname } from '~/selectors/router';

test('getCurrentPathname gets the current router pathname', () => {
  interface TestState {
    router: RouterState;
  }

  const state: TestState = {
    router: {
      action: 'PUSH',
      location: {
        search: '',
        state: '',
        hash: '',
        pathname: '/foo/bar',
      },
    },
  };

  expect(getCurrentPathname(state)).toEqual('/foo/bar');
});
