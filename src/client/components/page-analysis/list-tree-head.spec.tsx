import { render, RenderResult } from '@testing-library/react';
import React from 'react';

import ListTreeHead, { Props } from './list-tree-head';

import type { MainBlockName } from '~client/types';

describe('<PageAnalysis /> / <ListTreeHead />', () => {
  const props: Props = {
    income: 30,
    items: [
      {
        name: 'foo' as MainBlockName,
        itemCost: 3,
        ratio: 0.05,
        open: false,
        visible: true,
      },
      {
        name: 'bar' as MainBlockName,
        itemCost: 5,
        ratio: 0.08,
        open: false,
        visible: true,
      },
      {
        name: 'baz' as MainBlockName,
        itemCost: 1,
        ratio: 0.02,
        open: false,
        visible: false,
      },
    ],
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<ListTreeHead {...props} {...customProps} />);

  it('should render the total income', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('£0.30')).toBeInTheDocument();
  });

  it('should render the total cost', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('£0.09')).toBeInTheDocument();
  });

  it('should render the income percent as 100%', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('(100%)')).toBeInTheDocument();
  });

  it('should render the total cost as percent of income', () => {
    expect.assertions(1);
    const { getByText } = getContainer();
    expect(getByText('(30.0%)')).toBeInTheDocument();
  });
});
