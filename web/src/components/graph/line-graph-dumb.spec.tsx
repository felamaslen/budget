import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { LineGraphDumb, Props } from './line-graph-dumb';

describe('<LineGraphDumb />', () => {
  const getContainer = (customProps = {}): RenderResult => {
    const props: Props = {
      name: 'some-dumb-graph',
      dimensions: {
        width: 200,
        height: 100,
        padding: [10, 0, 3, 5],
        minX: 0,
        maxX: 10,
        minY: -3,
        maxY: 7,
      },
      outerProperties: {},
      svgProperties: {},
      lines: [
        {
          key: 'line1',
          data: [
            [100, 1],
            [101, 2],
            [102, -1],
            [103, 0],
          ],
          smooth: false,
          color: 'black',
        },
        {
          key: 'line2',
          data: [
            [100, 1],
            [101, 2],
            [102, -1],
            [103, 0],
          ],
          smooth: true,
          color: 'black',
          strokeWidth: 1.5,
        },
        {
          key: 'line3',
          data: [[100, 1]],
          smooth: false,
          color: 'black',
        },
        {
          key: 'line4',
          data: [[100, 1]],
          smooth: false,
          color: 'black',
        },
        {
          key: 'line5',
          data: [
            [100, 1],
            [102, 2],
          ],
          smooth: true,
          color: 'black',
        },
      ],
      calc: {
        pixX: (): number => 0,
        pixY1: (): number => 0,
        pixY2: (): number => 0,
        valX: (): number => 0,
        valY1: (): number => 0,
        valY2: (): number => 0,
      },
      ...customProps,
    };

    return render(<LineGraphDumb {...props} />);
  };

  it('should render line graph', () => {
    expect.assertions(4);
    const { container } = getContainer();

    expect(container.childNodes).toHaveLength(1);
    const graph = container.childNodes[0] as HTMLDivElement;

    expect(graph.tagName).toBe('DIV');
    expect(graph.childNodes).toHaveLength(1);

    const svg = graph.childNodes[0] as SVGElement;
    expect(svg.tagName).toBe('svg');
  });

  it('should not render any SVG data if there are no lines', () => {
    expect.assertions(1);
    const { container } = getContainer({ lines: [] });

    const svg = container.childNodes[0].childNodes[0];

    expect(svg.childNodes).toHaveLength(0);
  });

  it('should render lines', () => {
    expect.assertions(16);
    const { container } = getContainer();

    const svg = container.childNodes[0].childNodes[0] as SVGElement;

    expect(svg.childNodes).toHaveLength(5);

    (svg.childNodes as NodeListOf<SVGElement>).forEach(line => {
      expect(line.tagName).toBe('g');
      expect(line.childNodes).toHaveLength(1);

      const path = line.childNodes[0] as SVGPathElement;
      expect(path.tagName).toBe('path');
    });
  });
});
