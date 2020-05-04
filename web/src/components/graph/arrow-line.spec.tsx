import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { ArrowLine } from './arrow-line';
import { Data } from '~client/types/graph';

describe('<ArrowLine />', () => {
  const points: Data = [
    [0, 5],
    [1, 4.5],
    [2, 2.3],
    [3, -1.2],
  ];

  const getContainer = (): RenderResult => {
    const props = {
      data: points,
      color: 'black',
      minY: -5,
      maxY: 10,
      pixX: (xv: number): number => xv * 5 + 1,
      pixY1: (yv: number): number => yv * 10 + 2,
      pixY2: (yv: number): number => yv * 10 + 2,
    };

    return render(
      <svg>
        <ArrowLine {...props} />
      </svg>,
    );
  };

  it('should render a list of arrow SVG paths', () => {
    expect.assertions(1);

    const { container } = getContainer();

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg>
          <g>
            <g>
              <path
                d="M1,2 L1.0000000000000027,-41.55  L-4.2,-39.0 L1.0,-46.6 L6.3,-39.0 L1.0,-41.5"
                fill="black"
                stroke="black"
                stroke-width="1.5"
              />
            </g>
            <g>
              <path
                d="M6,2 L6.000000000000003,-36.894999999999996  L1.0,-34.4 L6.0,-41.8 L11.0,-34.4 L6.0,-36.9"
                fill="black"
                stroke="black"
                stroke-width="1.35"
              />
            </g>
            <g>
              <path
                d="M11,2 L11.000000000000002,-16.413  L7.0,-14.4 L11.0,-20.4 L15.0,-14.4 L11.0,-16.4"
                fill="black"
                stroke="black"
                stroke-width="0.69"
              />
            </g>
            <g>
              <path
                d="M16,2 L15.999999999999998,9.344  L20.1,7.3 L16.0,13.4 L11.9,7.3 L16.0,9.3"
                fill="black"
                stroke="black"
                stroke-width="0.72"
              />
            </g>
          </g>
        </svg>
      </div>
    `);
  });
});
