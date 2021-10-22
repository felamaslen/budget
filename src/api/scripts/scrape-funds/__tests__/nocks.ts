import path from 'path';
import fs from 'fs-extra';
import nock, { Scope } from 'nock';

const testFileFund = path.resolve(__dirname, '../vendor/fund-test-hl.html');
const testFileShare = path.resolve(__dirname, '../vendor/share-test-hl.html');
const testFileShareFX = path.resolve(__dirname, '../vendor/share-test-hl-dollar.html');

const testFileGenericShareJSON = path.resolve(__dirname, '../vendor/quote-yahoo.json');

export const nockHLFund = async (status = 200): Promise<Scope> =>
  nock('http://www.hl.co.uk')
    .get(
      '/funds/fund-discounts,-prices--and--factsheets/search-results/j/jupiter-asian-income-class-i-accumulation',
    )
    .reply(status, status === 200 ? await fs.readFile(testFileFund, 'utf8') : undefined);

export const nockHLShare = async (status = 200): Promise<Scope> =>
  nock('http://www.hl.co.uk')
    .get('/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p')
    .reply(status, status === 200 ? await fs.readFile(testFileShare, 'utf8') : undefined);

export const nockHLShareFX = async (status = 200): Promise<Scope> =>
  nock('http://www.hl.co.uk')
    .get('/shares/shares-search-results/a/apple-inc-com-stk-npv')
    .reply(status, status === 200 ? await fs.readFile(testFileShareFX, 'utf8') : undefined);

export const nockGeneralShare = async (status = 200): Promise<Scope> =>
  nock('https://query2.finance.yahoo.com')
    .get('/v7/finance/quote?symbols=REL.L%2CSMT.L')
    .reply(
      status,
      status === 200 ? await fs.readFile(testFileGenericShareJSON, 'utf8') : undefined,
    );
