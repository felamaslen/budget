import { Broker, Fund } from './types';
import { getFundUrl } from './scrape';

describe('getFundUrl', () => {
  it('should handle broker HL', () => {
    const fund: Pick<Fund, 'name' | 'broker'> = {
      broker: Broker.HL,
      name: 'foo (accum.)',
    };

    expect(getFundUrl(fund)).toMatch(/http:\/\/www\.hl\.co\.uk/);
  });
});
