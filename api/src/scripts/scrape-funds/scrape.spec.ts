import { getFundUrl } from './scrape';
import { Broker, Fund } from './types';

describe('getFundUrl', () => {
  it('should handle broker HL', () => {
    expect.assertions(1);
    const fund: Pick<Fund, 'name' | 'broker'> = {
      broker: Broker.HL,
      name: 'foo (accum.)',
    };

    expect(getFundUrl(fund)).toMatch(/http:\/\/www\.hl\.co\.uk/);
  });
});
