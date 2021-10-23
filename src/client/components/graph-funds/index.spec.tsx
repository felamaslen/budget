import getUnixTime from 'date-fns/getUnixTime';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import numericHash from 'string-hash';

import { GraphFunds } from '.';
import { testState } from '~client/test-data/state';
import { renderWithStore } from '~client/test-utils';
import { PageNonStandard } from '~client/types/enum';

describe('<GraphFunds />', () => {
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(() => {
    matchMedia.clear();
  });

  const getContainer = (): ReturnType<typeof renderWithStore> =>
    renderWithStore(<GraphFunds isMobile={false} />, {
      customState: {
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('some-fund-id'),
              item: 'Scottish Mortgage IT PLC Ordinary Shares 5p (share)',
              transactions: [
                {
                  date: new Date('2020-04-10'),
                  units: 100,
                  price: 99.6,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
              allocationTarget: 0,
            },
          ],
          startTime: getUnixTime(new Date('2020-04-20')),
          cacheTimes: [
            getUnixTime(new Date('2020-04-20')),
            getUnixTime(new Date('2020-05-20')),
            getUnixTime(new Date('2020-06-16')),
          ],
          prices: {
            [numericHash('some-fund-id')]: [
              {
                values: [100, 99, 101],
                startIndex: 0,
              },
            ],
          },
        },
      },
    });

  it('should render a graph', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    const graph = getByTestId('graph-svg') as HTMLElement;

    expect(graph).toBeInTheDocument();
  });

  it.each`
    stock    | title
    ${'SMT'} | ${'Scottish Mortgage IT PLC Ordinary Shares 5p (share)'}
  `('should render the abbreviated toggle for $stock', ({ stock, title }) => {
    expect.assertions(2);
    const { getAllByText } = getContainer();
    const [anchor] = getAllByText(stock) as [HTMLAnchorElement];
    expect(anchor).toBeInTheDocument();
    expect(anchor.title).toBe(title);
  });
});
