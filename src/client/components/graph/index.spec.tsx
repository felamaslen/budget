import { render, RenderResult } from '@testing-library/react';
import { Graph, Props } from '.';
import { Padding } from '~client/types/graph';

describe('<Graph />', () => {
  const getGraph = (customProps: Partial<Props> = {}): RenderResult => {
    const props: Props = {
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
    const { getByText } = getGraph({
      Before: <span>before1</span>,
    });
    expect(getByText('before1')).toBeInTheDocument();
  });

  it('should accept a child after the SVG', () => {
    expect.assertions(1);
    const { getByText } = getGraph({
      After: <span>after1</span>,
    });
    expect(getByText('after1')).toBeInTheDocument();
  });

  it('should accept children before and after the SVG', () => {
    expect.assertions(2);
    const { getByText } = getGraph({
      Before: <span>before1</span>,
      After: <span>after1</span>,
    });

    expect(getByText('before1')).toBeInTheDocument();
    expect(getByText('after1')).toBeInTheDocument();
  });
});
