import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentNode } from 'graphql';
import { generateImage } from 'jsdom-screenshot';
import React from 'react';
import { Client } from 'urql';
import { fromValue } from 'wonka';

import { GraphFundItem, Popout, Props } from '.';
import * as FundQueries from '~client/gql/queries/funds';

import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { FundHistoryIndividualQueryVariables } from '~client/types/gql';

describe('<GraphFundItem />', () => {
  const props: Props = {
    id: 123,
    item: 'My fund',
    values: [
      [
        [100, 42.3],
        [101, 41.2],
        [102, 45.9],
        [102.5, 46.9],
      ],
      [
        [104, 47.1],
        [105, 46.9],
        [106, 42.5],
      ],
    ],
    stockSplits: [{ date: new Date('2022-11-02'), ratio: 3 }],
    sold: false,
  };

  const mockClient = {
    executeQuery: ({
      variables,
      query,
    }: {
      variables: Record<string, unknown>;
      query: DocumentNode;
    }) => {
      if (
        query === FundQueries.FundHistoryIndividual &&
        (variables as FundHistoryIndividualQueryVariables).id === 123
      ) {
        return fromValue({
          data: {
            fundHistoryIndividual: {
              values: [
                { date: 1667239199, price: 806.22 * 3 },
                { date: 1667247661, price: 809.67 * 3 },
                { date: 1667301239, price: 765.18 * 3 },
                { date: 1667318912, price: 783.91 * 3 }, // 2022-11-01
                { date: 1667476991, price: 814.77 }, // 2022-11-03
                { date: 1667548872, price: 819.46 },
                { date: 1667615662, price: 817.42 },
                { date: 1667649184, price: 862.17 },
              ],
            },
          },
        });
      }
      return fromValue({ data: null });
    },
  } as unknown as Client;

  const setup = (customProps: Partial<Props> = {}): RenderResult =>
    render(
      <GQLProviderMock client={mockClient}>
        <GraphFundItem {...props} {...customProps} />
      </GQLProviderMock>,
    );

  beforeAll(async () => {
    await Popout.load();
  });

  it('should render a graph', async () => {
    expect.hasAssertions();
    setup();
    const screenshot = await generateImage();
    expect(screenshot).toMatchImageSnapshot();
  });

  describe('when focused', () => {
    it('should render a filled graph', async () => {
      expect.hasAssertions();
      const { getByRole } = setup();
      userEvent.click(getByRole('button'));
      const screenshot = await generateImage();
      expect(screenshot).toMatchImageSnapshot();
    });
  });

  describe.each`
    case                           | values
    ${'the values array is empty'} | ${[]}
    ${'there are no values'}       | ${null}
  `('when $case', ({ values }) => {
    it('should not render anything', () => {
      expect.assertions(1);
      expect(setup({ values }).container).toMatchInlineSnapshot(`<div />`);
    });
  });
});
