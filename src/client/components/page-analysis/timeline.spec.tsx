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
      .emotion-0 {
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

      @media only screen and (min-width: 1200px) {
        .emotion-0 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          grid-row: 1;
          grid-column: span 2;
        }
      }

      .emotion-2 {
        display: block;
        -webkit-box-flex: 1;
        -webkit-flex-grow: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        height: 100%;
      }

      <div>
        <div
          class="emotion-0 emotion-1"
        >
          <span
            class="emotion-2 emotion-3"
          />
          <span
            class="emotion-2 emotion-3"
          />
          <span
            class="emotion-2 emotion-3"
          />
          <span
            class="emotion-2 emotion-3"
          />
          <span
            class="emotion-2 emotion-3"
          />
        </div>
      </div>
    `);
  });
});
