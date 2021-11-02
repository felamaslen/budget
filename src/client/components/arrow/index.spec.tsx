import { render } from '@testing-library/react';
import React from 'react';

import { Arrow, Props } from '.';

describe('arrow', () => {
  const props: Props = {
    startX: 0,
    startY: 0,
    length: 29,
    angle: Math.PI / 8,
    arrowSize: 3,
    color: 'red',
    fill: false,
    pixY: (y) => 100 - y,
    pixX: (x) => x,
  };

  it('should render an un-filled arrow svg', () => {
    expect.assertions(1);
    const { container } = render(
      <svg>
        <Arrow {...props} fill={false} />
      </svg>,
    );
    expect(container.childNodes[0]).toMatchInlineSnapshot(`
      <svg>
        <g>
          <path
            d="M0,100 L7.113872400336907,97.05333757078881  L-10.2,82.0 L26.0,89.2 L5.5,119.9 L7.1,97.1"
            fill="none"
            stroke="red"
            stroke-width="1"
          />
        </g>
      </svg>
    `);
  });

  it('should render a filled arrow svg', () => {
    expect.assertions(1);
    const { container } = render(
      <svg>
        <Arrow {...props} fill={true} />
      </svg>,
    );
    expect(container.childNodes[0]).toMatchInlineSnapshot(`
      <svg>
        <g>
          <path
            d="M0,100 L7.113872400336907,97.05333757078881  L-10.2,82.0 L26.0,89.2 L5.5,119.9 L7.1,97.1"
            fill="red"
            stroke="red"
            stroke-width="1"
          />
        </g>
      </svg>
    `);
  });
});
