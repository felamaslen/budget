import userEvent from '@testing-library/user-event';

import { CashRow } from './cash-row';
import { TodayProvider } from '~client/hooks';
import * as listMutationHooks from '~client/hooks/mutations/list';
import { renderWithStore } from '~client/test-utils';

describe('<CashRow />', () => {
  const onCreate = jest.fn();
  const onUpdate = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.spyOn(listMutationHooks, 'useListCrudFunds').mockReturnValue({
      onCreate,
      onUpdate,
      onDelete,
    });
  });

  const setup = (): ReturnType<typeof renderWithStore> =>
    renderWithStore(
      <TodayProvider>
        <CashRow />
      </TodayProvider>,
    );

  it('should render the cash value with target', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('Cash')).toBeInTheDocument();
  });

  describe('when hovering over the cash value adjustment', () => {
    it('should render a preview box', () => {
      expect.assertions(4);
      const previewText = 'Buy £16k of stock to adjust';

      const { getByText, queryByText } = setup();

      expect(queryByText(previewText)).not.toBeInTheDocument();

      const cash = getByText('Cash') as HTMLDivElement;
      const adjustment = cash.nextSibling as HTMLDivElement;

      expect(adjustment).toBeInTheDocument();

      userEvent.hover(adjustment);

      expect(getByText(previewText)).toBeInTheDocument();

      userEvent.unhover(adjustment);

      expect(queryByText(previewText)).not.toBeInTheDocument();
    });
  });
});
