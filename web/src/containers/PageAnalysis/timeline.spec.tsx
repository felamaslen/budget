import { render, RenderResult } from '@testing-library/react';
import React from 'react';

import Timeline from './timeline';

describe('<PageAnalysis /> / <Timeline />', () => {
  const timeline = [
    [1, 5, 3, 9],
    [93, 10, 24, 40],
    [43, 19, 33.2, 10],
    [9, 23.5, 52, 1],
    [40, 3, 1, 20],
  ];

  const props = {
    data: timeline,
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<Timeline {...props} {...customProps} />);

  it('should render a timeline with the right colours', () => {
    expect.assertions(1);
    const { container } = getContainer();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-bsbRJL ctYdSN"
        >
          <span
            class="sc-hZSUBg fjbdzl"
            color="rgb(211,231,227)"
            style="background-color: rgb(211, 231, 227);"
          />
          <span
            class="sc-hZSUBg fjbdzl"
            color="rgb(218,209,209)"
            style="background-color: rgb(218, 209, 209);"
          />
          <span
            class="sc-hZSUBg fjbdzl"
            color="rgb(215,213,214)"
            style="background-color: rgb(215, 213, 214);"
          />
          <span
            class="sc-hZSUBg fjbdzl"
            color="rgb(204,219,223)"
            style="background-color: rgb(204, 219, 223);"
          />
          <span
            class="sc-hZSUBg fjbdzl"
            color="rgb(224,213,211)"
            style="background-color: rgb(224, 213, 211);"
          />
        </div>
      </div>
    `);
  });
});
