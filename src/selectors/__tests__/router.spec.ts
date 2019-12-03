import { getCurrentPathname } from '~/selectors/router';
import { State } from '~/reducers';

test('getCurrentPathname gets the current router pathname', () => {
  const state: State = {
    router: {
      location: {
        pathname: '/foo/bar',
      },
    },
  };

  expect(getCurrentPathname(state)).toEqual('/foo/bar');
});
