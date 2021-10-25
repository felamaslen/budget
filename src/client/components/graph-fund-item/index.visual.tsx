import userEvent from '@testing-library/user-event';
import React from 'react';

import * as stubs from './__tests__/stubs';
import { GraphFundItem } from '.';
import { renderVisualTest, renderWithStore } from '~client/test-utils';

describe('[visual] GraphFundItem', () => {
  beforeEach(stubs.mockApiResponse);

  it('should render a graph', async () => {
    expect.hasAssertions();
    renderWithStore(<GraphFundItem {...stubs.props} />);
    const screenshot = await renderVisualTest();
    expect(screenshot).toMatchImageSnapshot();
  });

  describe('when focused', () => {
    it('should render a filled graph', async () => {
      expect.hasAssertions();
      const { getByRole } = renderWithStore(<GraphFundItem {...stubs.props} />);
      userEvent.click(getByRole('button'));
      const screenshot = await renderVisualTest();
      expect(screenshot).toMatchImageSnapshot();
    });
  });
});
