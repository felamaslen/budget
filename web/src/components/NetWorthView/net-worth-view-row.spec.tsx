import React from 'react';
import { render, RenderResult } from '@testing-library/react';

import NetWorthViewRow from './net-worth-view-row';

describe('<NetWorthViewRow />', () => {
  const props = {
    date: new Date('2020-04-20'),
    assets: 8156429,
    liabilities: 287130,
    expenses: 318715,
    fti: 98.18,
  };

  const getContainer = (customProps = {}): RenderResult =>
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
  ])('should render the correct short date for %s', async (_, date, expectedShortDate) => {
    expect.assertions(1);
    const { findByText } = getContainer({ date });
    expect(await findByText(expectedShortDate)).toBeInTheDocument();
  });

  it('should render the long date', async () => {
    expect.assertions(1);
    const { findByText } = getContainer();
    expect(await findByText('20/04/2020')).toBeInTheDocument();
  });

  it('should render the assets', async () => {
    expect.assertions(1);
    const { findByText } = getContainer();
    expect(await findByText('£81,564.29')).toBeInTheDocument();
  });

  it('should render the liabilities', async () => {
    expect.assertions(1);
    const { findByText } = getContainer();
    expect(await findByText('£2,871.30')).toBeInTheDocument();
  });

  it('should render the net worth', async () => {
    expect.assertions(1);
    const { findByText } = getContainer();
    expect(await findByText('£78,692.99')).toBeInTheDocument();
  });

  it('should render negative net worth with brackets', async () => {
    expect.assertions(1);
    const { findByText } = getContainer({
      liabilities: props.assets + 25998,
    });
    expect(await findByText('(£259.98)')).toBeInTheDocument();
  });

  it('should render the expenses', async () => {
    expect.assertions(1);
    const { findByText } = getContainer();
    expect(await findByText('£3,187.15')).toBeInTheDocument();
  });

  it('should render the FTI', async () => {
    expect.assertions(1);
    const { findByText } = getContainer();
    expect(await findByText('98.18')).toBeInTheDocument();
  });
});
