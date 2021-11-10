import { FundWeights } from '.';
import { renderWithStore } from '~client/test-utils';

describe('<FundWeights />', () => {
  const setup = (): ReturnType<typeof renderWithStore> => renderWithStore(<FundWeights />);

  it('should render a block tree', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const graph = getByTestId('block-tree');
    expect(graph).toBeInTheDocument();
  });
});
