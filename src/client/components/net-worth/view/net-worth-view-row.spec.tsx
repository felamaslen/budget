import { render, RenderResult } from '@testing-library/react';

import { NetWorthViewRow, Props } from './net-worth-view-row';

describe('<NetWorthViewRow />', () => {
  const props: Props = {
    isMobile: false,
    date: new Date('2020-04-20'),
    assets: 8156429,
    liabilities: 287130,
    expenses: 318715,
    fti: 98.18,
    id: 1,
    onSelect: jest.fn(),
  };

  const setup = (customProps = {}): RenderResult =>
    render(
      <table>
        <thead>
          <NetWorthViewRow {...props} {...customProps} />
        </thead>
      </table>,
    );

  it.each([
    ['January', new Date('2020-01-20'), 'Jan'],
    ['February', new Date('2020-02-29'), 'Feb'],
    ['March', new Date('2020-03-17'), '20Q1'],
    ['April', new Date('2020-04-04'), 'Apr'],
    ['May', new Date('2020-05-11'), 'May'],
    ['June', new Date('2020-06-30'), '20Q2'],
    ['July', new Date('2020-07-15'), 'Jul'],
    ['August', new Date('2020-08-21'), 'Aug'],
    ['September', new Date('2020-09-19'), '20Q3'],
    ['October', new Date('2020-10-13'), 'Oct'],
    ['November', new Date('2020-11-01'), 'Nov'],
    ['December', new Date('2020-12-30'), '20Q4'],
  ])('should render the correct short date for %s', (_, date, expectedShortDate) => {
    expect.assertions(1);
    const { getByText } = setup({ date });
    expect(getByText(expectedShortDate)).toBeInTheDocument();
  });

  it('should render the long date', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('20/04/2020')).toBeInTheDocument();
  });

  it('should render the assets', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('£81,564.29')).toBeInTheDocument();
  });

  it('should render the liabilities', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('£2,871.30')).toBeInTheDocument();
  });

  it('should render the net worth', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('£78,692.99')).toBeInTheDocument();
  });

  it('should render negative net worth with brackets', () => {
    expect.assertions(1);
    const { getByText } = setup({
      liabilities: props.assets + 25998,
    });
    expect(getByText('(£259.98)')).toBeInTheDocument();
  });

  it('should render the expenses', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('£3,187.15')).toBeInTheDocument();
  });

  it('should render the FTI', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('98.18')).toBeInTheDocument();
  });

  describe('when isMobile is true', () => {
    const setupMobile = (): RenderResult => setup({ isMobile: true });

    it.each`
      item             | value
      ${'assets'}      | ${'£81.6k'}
      ${'liabilities'} | ${'£2.9k'}
      ${'net worth'}   | ${'£78.7k'}
      ${'expenses'}    | ${'£3.2k'}
    `('should render abbreviated $item', ({ value }) => {
      expect.assertions(1);
      const { getByText } = setupMobile();
      expect(getByText(value)).toBeInTheDocument();
    });
  });
});
