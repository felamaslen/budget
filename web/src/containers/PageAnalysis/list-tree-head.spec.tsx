import { render, RenderResult } from '@testing-library/react';
import React from 'react';

import ListTreeHead from './list-tree-head';

describe('<PageAnalysis /> / <ListTreeHead />', () => {
  const props = {
    items: [
      {
        name: 'foo',
        itemCost: 3,
        pct: 5,
        open: false,
        visible: true,
      },
      {
        name: 'bar',
        itemCost: 5,
        pct: 8,
        open: false,
        visible: true,
      },
      {
        name: 'baz',
        itemCost: 1,
        pct: 2,
        open: false,
        visible: false,
      },
    ],
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<ListTreeHead {...props} {...customProps} />);

  it('should render the total cost', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('£0.09')).toBeInTheDocument();
  });

  it('should render the selected cost', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('£0.08')).toBeInTheDocument();
  });

  it('should render the total percent', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('15.0%')).toBeInTheDocument();
  });

  it('should render the selected percent', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('13.0%')).toBeInTheDocument();
  });
});
