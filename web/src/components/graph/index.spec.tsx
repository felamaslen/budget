import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { Graph } from '.';
import { Padding } from '~client/types/graph';

describe('<Graph />', () => {
  const getGraph = (customProps = {}): RenderResult => {
    const props = {
      name: 'foo',
      width: 200,
      height: 100,
      padding: [10, 10, 10, 10] as Padding,
      ...customProps,
    };

    return render(
      <Graph {...props}>
        <span>{'child text'}</span>
      </Graph>,
    );
  };

  it('should render the children', () => {
    expect.assertions(1);
    const { getByText } = getGraph();
    expect(getByText('child text')).toBeInTheDocument();
  });

  it('should accept a chlid before the SVG', () => {
    expect.assertions(1);
    const Before: React.FC = () => <span>{'before1'}</span>;
    const { getByText } = getGraph({
      before: Before,
    });
    expect(getByText('before1')).toBeInTheDocument();
  });

  it('should accept a child after the SVG', () => {
    expect.assertions(1);
    const After: React.FC = () => <span>{'after1'}</span>;
    const { getByText } = getGraph({
      after: After,
    });
    expect(getByText('after1')).toBeInTheDocument();
  });

  it('should accept children before and after the SVG', () => {
    expect.assertions(2);
    const Before: React.FC = () => <span>{'before1'}</span>;
    const After: React.FC = () => <span>{'after1'}</span>;

    const { getByText } = getGraph({
      before: Before,
      after: After,
    });

    expect(getByText('before1')).toBeInTheDocument();
    expect(getByText('after1')).toBeInTheDocument();
  });
});
