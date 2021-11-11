import { render } from '@testing-library/react';

import * as stubs from './__tests__/stubs';
import { BlockPacker } from '.';
import { GlobalStylesProvider } from '~client/styled/global';
import { renderVisualTest } from '~client/test-utils';

describe('[visual] block packer', () => {
  it('should render a block tree', async () => {
    expect.assertions(1);
    render(
      <GlobalStylesProvider>
        <BlockPacker {...stubs.props} />
      </GlobalStylesProvider>,
    );

    const screenshot = await renderVisualTest();
    expect(screenshot).toMatchImageSnapshot();
  });

  describe('when the blocks are null', () => {
    it('should not render blocks', async () => {
      expect.assertions(1);
      render(
        <GlobalStylesProvider>
          <BlockPacker {...stubs.props} blocks={null} />
        </GlobalStylesProvider>,
      );

      const screenshot = await renderVisualTest();
      expect(screenshot).toMatchImageSnapshot();
    });
  });
});
