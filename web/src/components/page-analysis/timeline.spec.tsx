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
      .c0 {
        width: 100%;
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 0 0 1em;
        -ms-flex: 0 0 1em;
        flex: 0 0 1em;
        overflow: hidden;
      }

      .c1 {
        display: block;
        -webkit-box-flex: 1;
        -webkit-flex-grow: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        height: 100%;
      }

      @media only screen and (min-width:1200px) {
        .c0 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          grid-row: 1;
          grid-column: span 2;
        }
      }

      <div>
        <div
          class="c0"
        >
          <span
            class="c1"
            color="#d3e6.4e2.8"
          />
          <span
            class="c1"
            color="#d9.cd1d1.4"
          />
          <span
            class="c1"
            color="#d7.4d5.8d6.8"
          />
          <span
            class="c1"
            color="#cc.8db.8df.4"
          />
          <span
            class="c1"
            color="#df.cd5.4d3.8"
          />
        </div>
      </div>
    `);
  });
});
