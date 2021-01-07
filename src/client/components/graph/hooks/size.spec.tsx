import { render, RenderResult } from '@testing-library/react';
import React from 'react';

import { useGraphWidth } from './size';
import { GRAPH_WIDTH } from '~client/constants/graph';
import { ResizeContext } from '~client/hooks';

describe('Graph width hook', () => {
  const mockWindowWidth = 1039;

  const TestComponent: React.FC<{ width?: number }> = ({ width }) => {
    const graphWidth = useGraphWidth(width);

    return <span>{graphWidth}</span>;
  };

  const setup = (width?: number): RenderResult =>
    render(
      <ResizeContext.Provider value={mockWindowWidth}>
        <TestComponent width={width} />
      </ResizeContext.Provider>,
    );

  describe('if the window width is larger than the given width', () => {
    it('should return the given width', () => {
      expect.assertions(1);
      const { container } = setup(mockWindowWidth - 1);
      expect(container).toHaveTextContent('1038');
    });
  });

  describe('if the window width is smaller than the given width', () => {
    it('should return the window width', () => {
      expect.assertions(1);
      const { container } = setup(mockWindowWidth + 1);
      expect(container).toHaveTextContent('1039');
    });
  });

  it(`should use ${GRAPH_WIDTH} as the given width by default`, () => {
    expect.assertions(2);
    expect(GRAPH_WIDTH).toBeLessThan(mockWindowWidth);
    const { container } = setup();
    expect(container).toHaveTextContent(String(GRAPH_WIDTH));
  });
});
