import { RenderResult } from '@testing-library/react';
import React from 'react';

import * as stubs from './__tests__/stubs';
import { GraphFundItem, Popout, Props } from '.';

import { renderWithStore } from '~client/test-utils';

describe('<GraphFundItem />', () => {
  const setup = (customProps: Partial<Props> = {}): RenderResult =>
    renderWithStore(<GraphFundItem {...stubs.props} {...customProps} />);

  beforeEach(stubs.mockApiResponse);

  beforeAll(async () => {
    await Popout.load();
  });

  describe.each`
    case                           | values
    ${'the values array is empty'} | ${[]}
    ${'there are no values'}       | ${null}
  `('when $case', ({ values }) => {
    it('should not render anything', () => {
      expect.assertions(1);
      expect(setup({ values }).container).toMatchInlineSnapshot(`<div />`);
    });
  });
});
