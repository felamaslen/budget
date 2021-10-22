import { getGenericQuotes } from './prices';
import { Broker, Fund } from './types';
import * as finance from '~api/modules/finance';

jest.mock('~api/modules/finance');

describe(getGenericQuotes.name, () => {
  it('should scrape prices for all matching symbols', async () => {
    expect.assertions(3);

    const funds: Pick<Fund, 'name' | 'broker'>[] = [
      { broker: Broker.Generic, name: 'Scottish Mortgage Investment Trust (SMT.L) (stock)' },
      { broker: Broker.HL, name: 'Some fund (accum.)' },
      { broker: Broker.Generic, name: 'RELX options (REL.L) (stock)' },
    ];

    const getQuoteSpy = jest.spyOn(finance, 'getMultipleStockQuotes').mockResolvedValueOnce({
      'SMT.L': 1450,
      'REL.L': 228,
    });

    const result = await getGenericQuotes(funds);

    expect(getQuoteSpy).toHaveBeenCalledTimes(1);
    expect(getQuoteSpy).toHaveBeenCalledWith(['SMT.L', 'REL.L']);

    expect(result).toStrictEqual([1450, null, 228]);
  });
});
