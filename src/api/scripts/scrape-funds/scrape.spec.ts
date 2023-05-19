import { getFundUrl } from './scrape';
import { Broker, Fund } from './types';

describe('getFundUrl', () => {
  it('should handle broker HL', () => {
    expect.assertions(1);
    const fund: Pick<Fund, 'name' | 'broker'> = {
      broker: Broker.HL,
      name: 'foo (accum.)',
    };

    expect(getFundUrl(fund)).toMatch(/https:\/\/www\.hl\.co\.uk/);
  });

  it('should return null for generic broker', () => {
    expect.assertions(1);
    expect(
      getFundUrl({
        broker: Broker.Generic,
        name: 'Something (code) (stock)',
      }),
    ).toBeNull();
  });
});
