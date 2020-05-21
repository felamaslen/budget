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
          class="sc-hZSUBg bfDKKC"
        >
          <span
            class="sc-cMhqgX eoUPhG"
            color="#d3e6.4e2.8"
          />
          <span
            class="sc-cMhqgX eoUPhG"
            color="#d9.cd1d1.4"
          />
          <span
            class="sc-cMhqgX eoUPhG"
            color="#d7.4d5.8d6.8"
          />
          <span
            class="sc-cMhqgX eoUPhG"
            color="#cc.8db.8df.4"
          />
          <span
            class="sc-cMhqgX eoUPhG"
            color="#df.cd5.4d3.8"
          />
        </div>
      </div>
    `);
  });
});
