/* eslint-disable max-len */
import { render, RenderResult, act } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import { Pie } from '.';

describe('<Pie />', () => {
  let clock: sinon.SinonFakeTimers;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    clock.restore();
  });

  const props = {
    size: 20,
    startAngle: 0,
    slice: 0.4,
    color: 'red',
  };

  const setup = (customProps = {}, renderProps?: Pick<RenderResult, 'container'>): RenderResult =>
    render(<Pie {...props} {...customProps} />, renderProps);

  it('should render a pie sector', () => {
    expect.assertions(1);
    const { container } = setup();
    act(() => {
      clock.runAll();
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg
          height="20"
          width="20"
        >
          <g>
            <circle
              cx="10"
              cy="10"
              fill="none"
              r="10"
              stroke="red"
            />
            <path
              d="M10,10 L10,0 A10,10 0,0,1 13.894183423086503,0.789390059971149 L10,10"
              fill="red"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    `);
  });

  it('should animate when initially rendering', () => {
    expect.assertions(3);
    const { container } = setup();

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg
          height="20"
          width="20"
        >
          <g>
            <circle
              cx="10"
              cy="10"
              fill="none"
              r="10"
              stroke="red"
            />
            <path
              d="M10,10 L10,0 A10,10 0,0,1 10,0 L10,10"
              fill="red"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    `);

    act(() => {
      clock.tick(100);
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg
          height="20"
          width="20"
        >
          <g>
            <circle
              cx="10"
              cy="10"
              fill="none"
              r="10"
              stroke="red"
            />
            <path
              d="M10,10 L10,0 A10,10 0,0,1 10.624593178423803,0.019524892999008836 L10,10"
              fill="red"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    `);

    act(() => {
      clock.runAll();
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg
          height="20"
          width="20"
        >
          <g>
            <circle
              cx="10"
              cy="10"
              fill="none"
              r="10"
              stroke="red"
            />
            <path
              d="M10,10 L10,0 A10,10 0,0,1 13.894183423086503,0.789390059971149 L10,10"
              fill="red"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    `);
  });

  it('should animate when changing the size', () => {
    expect.assertions(3);
    const { container } = setup();
    act(() => {
      clock.runAll();
    });

    act(() => {
      setup({ slice: 0.7, startAngle: 0.3 }, { container });
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg
          height="20"
          width="20"
        >
          <g>
            <circle
              cx="10"
              cy="10"
              fill="none"
              r="10"
              stroke="red"
            />
            <path
              d="M10,10 L10,0 A10,10 0,0,1 13.894183423086503,0.789390059971149 L10,10"
              fill="red"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    `);

    act(() => {
      clock.tick(50);
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg
          height="20"
          width="20"
        >
          <g>
            <circle
              cx="10"
              cy="10"
              fill="none"
              r="10"
              stroke="red"
            />
            <path
              d="M10,10 L10.234353542917226,0.0027464563050050295 A10,10 0,0,1 14.32149517642868,0.9819802927636245 L10,10"
              fill="red"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    `);

    act(() => {
      clock.runAll();
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <svg
          height="20"
          width="20"
        >
          <g>
            <circle
              cx="10"
              cy="10"
              fill="none"
              r="10"
              stroke="red"
            />
            <path
              d="M10,10 L12.955202066613396,0.4466351087439402 A10,10 0,0,1 18.414709848078964,4.596976941318603 L10,10"
              fill="red"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    `);
  });
});
