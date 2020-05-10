import db from '~api/modules/db';

describe('Server - integration tests (search)', () => {
  const cleanup = async (): Promise<void> => {
    await db('food').truncate();
    await db('bills').truncate();
  };

  beforeAll(async () => {
    await cleanup();

    await db('food').insert([
      {
        uid: global.uid,
        date: '2020-04-20',
        item: 'Pears',
        category: 'Fruit',
        cost: 1,
        shop: 'Tesco',
      },
      {
        uid: global.uid,
        date: '2020-04-20',
        item: 'Apples',
        category: 'Fruit',
        cost: 1,
        shop: "Sainsbury's",
      },
      {
        uid: global.uid,
        date: '2020-04-20',
        item: 'Chocolate fondue',
        category: 'Fondue',
        cost: 1,
        shop: 'Chocolate shop',
      },
      {
        uid: global.uid,
        date: '2020-04-20',
        item: 'Apple pie',
        category: 'Dessert',
        cost: 1,
        shop: 'Waitrose',
      },
    ]);

    await db('bills').insert([
      {
        uid: global.uid,
        date: '2020-04-20',
        item: 'Mortgage',
        cost: 1,
      },
      {
        uid: global.uid,
        date: '2020-04-20',
        item: 'Water',
        cost: 1,
      },
      {
        uid: global.uid,
        date: '2020-04-20',
        item: 'Rent',
        cost: 1,
      },
    ]);
  });

  afterAll(cleanup);

  it.each`
    case          | page       | column        | searchTerm   | results
    ${'initial'}  | ${'food'}  | ${'item'}     | ${'p'}       | ${['Pears']}
    ${'short'}    | ${'food'}  | ${'item'}     | ${'app'}     | ${['Apples', 'Apple pie']}
    ${'exact'}    | ${'food'}  | ${'item'}     | ${'apple p'} | ${['Apple pie', 'Pears', 'Apples']}
    ${'frequent'} | ${'food'}  | ${'category'} | ${'f'}       | ${['Fruit', 'Fondue']}
    ${'page'}     | ${'bills'} | ${'item'}     | ${'r'}       | ${['Rent']}
  `('should return $case matches', async ({ page, column, searchTerm, results }) => {
    expect.assertions(2);
    const res = await global.withAuth(
      global.agent.get(`/api/v4/data/search/${page}/${column}/${searchTerm}`),
    );

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      data: expect.objectContaining({
        list: results,
      }),
    });
  });

  it.each`
    case                 | page      | column    | searchTerm   | nextCategory
    ${'for each result'} | ${'food'} | ${'item'} | ${'apple p'} | ${['Dessert', 'Fruit', 'Fruit']}
  `(
    'should give next category matches $case',
    async ({ page, column, searchTerm, nextCategory }) => {
      expect.assertions(2);
      const res = await global.withAuth(
        global.agent.get(`/api/v4/data/search/${page}/${column}/${searchTerm}`),
      );

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        data: expect.objectContaining({
          nextCategory,
          nextField: 'category',
        }),
      });
    },
  );

  it.each`
    page       | column    | searchTerm
    ${'bills'} | ${'item'} | ${'r'}
  `(
    'should not give next category matches for the $page page',
    async ({ page, column, searchTerm }) => {
      expect.assertions(3);
      const res = await global.withAuth(
        global.agent.get(`/api/v4/data/search/${page}/${column}/${searchTerm}`),
      );

      expect(res.status).toBe(200);
      expect(res.body.data).not.toHaveProperty('nextCategory');
      expect(res.body.data).not.toHaveProperty('nextField');
    },
  );

  it('should limit the number of results', async () => {
    expect.assertions(2);
    const res = await global.withAuth(global.agent.get('/api/v4/data/search/food/item/a/2'));

    expect(res.status).toBe(200);
    expect(res.body.data.list).toHaveLength(2);
  });
});
