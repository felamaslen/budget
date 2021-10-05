import gql from 'graphql-tag';
import { sql } from 'slonik';
import { getPool } from '~api/modules/db';
import { App, getTestApp } from '~api/test-utils/create-server';
import {
  Query,
  QuerySearchArgs,
  QueryReceiptItemArgs,
  QueryReceiptItemsArgs,
  SearchPage,
  SearchItem,
  PageListStandard,
} from '~api/types/gql';

describe('Search resolvers', () => {
  let app: App;
  beforeAll(async () => {
    await getPool().connect(async (db) => {
      app = await getTestApp();

      await db.query(
        sql`DELETE FROM list_standard WHERE uid = ${app.uid} AND page IN ('bills', 'food')`,
      );

      await db.query(sql`
      INSERT INTO list_standard (page, uid, date, item, category, value, shop)
      SELECT * FROM ${sql.unnest(
        [
          [PageListStandard.Food, app.uid, '2020-04-20', 'Pears', 'Fruit', 1, 'Tesco'],
          [PageListStandard.Food, app.uid, '2020-04-20', 'Apples', 'Fruit', 1, "Sainsbury's"],
          [
            PageListStandard.Food,
            app.uid,
            '2020-04-20',
            'Chocolate fondue',
            'Fondue',
            1,
            'Chocolate shop',
          ],
          [PageListStandard.Food, app.uid, '2020-04-20', 'Apple pie', 'Dessert', 1, 'Waitrose'],
          [PageListStandard.Bills, app.uid, '2020-04-20', 'Mortgage', 'Housing', 1, 'My bank'],
          [
            PageListStandard.Bills,
            app.uid,
            '2020-04-20',
            'Water',
            'Utilities',
            1,
            'My water company',
          ],
          [PageListStandard.Bills, app.uid, '2020-04-20', 'Rent', 'Housing', 1, 'My landlord'],
        ],
        ['page_category', 'int4', 'date', 'text', 'text', 'int4', 'text'],
      )}
      `);
    });
  });

  const search = gql`
    query SearchSuggestions(
      $page: SearchPage!
      $column: SearchItem!
      $searchTerm: String!
      $numResults: Int
    ) {
      search(page: $page, column: $column, searchTerm: $searchTerm, numResults: $numResults) {
        error
        searchTerm
        list
        nextCategory
        nextField
      }
    }
  `;

  describe('when not logged in', () => {
    it('should return null', async () => {
      expect.assertions(1);
      const res = await app.gqlClient.query<Query, QuerySearchArgs>({
        query: search,
        variables: {
          page: SearchPage.Food,
          column: SearchItem.Item,
          searchTerm: 'f',
        },
      });
      expect(res.data?.search).toBeNull();
    });
  });

  it.each`
    case          | page       | column        | searchTerm   | results
    ${'initial'}  | ${'food'}  | ${'item'}     | ${'p'}       | ${['Pears']}
    ${'short'}    | ${'food'}  | ${'item'}     | ${'app'}     | ${['Apples', 'Apple pie']}
    ${'exact'}    | ${'food'}  | ${'item'}     | ${'apple p'} | ${['Apple pie', 'Pears', 'Apples']}
    ${'frequent'} | ${'food'}  | ${'category'} | ${'f'}       | ${['Fruit', 'Fondue']}
    ${'page'}     | ${'bills'} | ${'item'}     | ${'r'}       | ${['Rent']}
  `('should return $case matches', async ({ page, column, searchTerm, results }) => {
    expect.assertions(2);

    const res = await app.authGqlClient.query<Query, QuerySearchArgs>({
      query: search,
      variables: {
        page,
        column,
        searchTerm,
      },
    });

    expect(res.data.search).toStrictEqual(
      expect.objectContaining({
        error: null,
        searchTerm,
        list: expect.arrayContaining(results),
      }),
    );
    expect(res.data.search?.list).toHaveLength(results.length);
  });

  it.each`
    case                 | page      | column    | searchTerm   | nextCategory
    ${'for each result'} | ${'food'} | ${'item'} | ${'apple p'} | ${['Dessert', 'Fruit', 'Fruit']}
  `(
    'should give next category matches $case',
    async ({ page, column, searchTerm, nextCategory }) => {
      expect.assertions(2);
      const res = await app.authGqlClient.query<Query, QuerySearchArgs>({
        query: search,
        variables: { page, column, searchTerm },
      });

      expect(res.data.search).toStrictEqual(
        expect.objectContaining({
          error: null,
          nextCategory: expect.arrayContaining(nextCategory),
          nextField: 'category',
        }),
      );
      expect(res.data.search?.nextCategory).toHaveLength(nextCategory.length);
    },
  );

  it.each`
    page       | column    | searchTerm
    ${'bills'} | ${'item'} | ${'r'}
  `(
    'should not give next category matches for the $page page',
    async ({ page, column, searchTerm }) => {
      expect.assertions(1);
      const res = await app.authGqlClient.query<Query, QuerySearchArgs>({
        query: search,
        variables: { page, column, searchTerm },
      });

      expect(res.data.search).toStrictEqual(
        expect.objectContaining({
          error: null,
          nextCategory: ['Housing'],
          nextField: 'category',
        }),
      );
    },
  );

  it('should limit the number of results', async () => {
    expect.assertions(1);
    const res = await app.authGqlClient.query<Query, QuerySearchArgs>({
      query: search,
      variables: { page: SearchPage.Food, column: SearchItem.Item, searchTerm: 'a', numResults: 2 },
    });

    expect(res.data.search?.list).toHaveLength(2);
  });

  describe('ReceiptItem', () => {
    const receiptItem = gql`
      query ReceiptItem($item: String!) {
        receiptItem(item: $item)
      }
    `;

    describe('when not logged in', () => {
      it('should return null', async () => {
        expect.assertions(1);
        const res = await app.gqlClient.query<Query, QueryReceiptItemArgs>({
          query: receiptItem,
          variables: {
            item: 'foo',
          },
        });
        expect(res.data?.receiptItem).toBeNull();
      });
    });

    it('should give the best matching item', async () => {
      expect.assertions(1);
      const res = await app.authGqlClient.query<Query, QueryReceiptItemArgs>({
        query: receiptItem,
        variables: {
          item: 'ch',
        },
      });

      expect(res.data?.receiptItem).toBe('Chocolate fondue');
    });

    it('should only return item information relating to receipt pages', async () => {
      expect.assertions(1);
      await getPool().query(sql`
      INSERT INTO list_standard (uid, page, date, item, category, value, shop)
      VALUES (${app.uid}, ${
        PageListStandard.Bills
      }, ${'2020-04-20'}, ${'Road tax'}, ${'Tax'}, ${15100}, ${'DVLA'})
      `);

      await app.authGqlClient.clearStore();
      const res = await app.authGqlClient.query<Query, QueryReceiptItemArgs>({
        query: receiptItem,
        variables: {
          item: 'roa',
        },
      });

      expect(res.data?.receiptItem).not.toBe('Road tax');
    });

    describe('when no item matches', () => {
      it('should return null', async () => {
        expect.assertions(1);
        const res = await app.authGqlClient.query<Query, QueryReceiptItemArgs>({
          query: receiptItem,
          variables: {
            item: 'ch1234',
          },
        });

        expect(res.data?.receiptItem).toBeNull();
      });
    });
  });

  describe('ReceiptItems', () => {
    const receiptItems = gql`
      query ReceiptItems($items: [String!]!) {
        receiptItems(items: $items) {
          item
          page
          category
        }
      }
    `;

    describe('when not logged in', () => {
      it('should return null', async () => {
        expect.assertions(1);
        const res = await app.gqlClient.query<Query, QueryReceiptItemsArgs>({
          query: receiptItems,
          variables: {
            items: ['foo'],
          },
        });
        expect(res.data?.receiptItems).toBeNull();
      });
    });

    it('should return the category information for the list of items', async () => {
      expect.assertions(2);
      const res = await app.authGqlClient.query<Query, QueryReceiptItemsArgs>({
        query: receiptItems,
        variables: {
          items: ['Chocolate fondue', 'Apples', 'Something which should be ignored'],
        },
      });

      expect(res.data?.receiptItems).toHaveLength(2);
      expect(res.data?.receiptItems).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'Chocolate fondue',
            page: 'food',
            category: 'Fondue',
          }),
          expect.objectContaining({
            item: 'Apples',
            page: 'food',
            category: 'Fruit',
          }),
        ]),
      );
    });

    it('should only return category information relating to receipt pages', async () => {
      expect.assertions(1);
      await getPool().query(sql`
      INSERT INTO list_standard (uid, page, date, item, category, value, shop)
      VALUES (${app.uid}, ${
        PageListStandard.Bills
      }, ${'2020-04-20'}, ${'Apple'}, ${'Subscriptions'}, ${123}, ${'Some shop'})
      `);

      await app.authGqlClient.clearStore();
      const res = await app.authGqlClient.query<Query, QueryReceiptItemsArgs>({
        query: receiptItems,
        variables: {
          items: ['Apple'],
        },
      });

      expect(res.data?.receiptItems).not.toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'Apple',
            page: PageListStandard.Bills,
          }),
        ]),
      );
    });
  });
});
