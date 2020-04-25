// import { Response } from 'supertest';

// import { PeriodCost } from '~api/routes/data/analysis';

describe('API integration tests - Analysis', () => {
  describe('GET /data/analysis/{period}/{groupBy}/{pageIndex}', () => {
    describe('with no options', () => {
      // let response: Response;
      // let res: { data: PeriodCost };
      // beforeAll(async () => {
      // });

      it('should return 200 status code', async () => {
        expect(1).toEqual(1);
        const res = await global.withAuth(global.agent.get('/api/v4/data/analysis'));
        expect(res.status).toBe(200);
      });

      it('should return costs grouped by year / category', async () => {
        const res = await global.withAuth(global.agent.get('/api/v4/data/analysis'));
        console.log('body', res.body);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('cost');

        console.log(res.body.data.cost);
      });
    });
  });
});
