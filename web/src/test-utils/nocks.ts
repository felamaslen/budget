import nock, { Scope, Interceptor } from 'nock';

import { API_PREFIX } from '~client/constants/data';
import { withoutId } from '~client/modules/data';
import { CATEGORY_CASH, SUBCATEGORY_WALLET, ENTRY_BANK_HOUSE_RAW } from '~client/test-data';
import { Item } from '~client/types';

export const testApiKey = 'test-api-key-19v9alkas';

const withAuthRequired = (scope: Interceptor): Interceptor =>
  scope.matchHeader('Authorization', testApiKey);

const makeAuthCrudNocks = <T extends Item>(
  route: string,
  defaultItem: T,
): {
  create: (item?: T) => Scope;
  update: (item?: T) => Scope;
  delete: (item?: T) => Scope;
} => ({
  create: (item: T = defaultItem): Scope =>
    withAuthRequired(
      nock('http://localhost').post(`${API_PREFIX}/${route}`, withoutId(item) as {}),
    ).reply(201, item),

  update: (item: T = defaultItem): Scope =>
    withAuthRequired(
      nock('http://localhost').put(`${API_PREFIX}/${route}/${item.id}`, withoutId(item) as {}),
    ).reply(200, item),

  delete: (item: T = defaultItem): Scope =>
    withAuthRequired(nock('http://localhost').delete(`${API_PREFIX}/${route}/${item.id}`)).reply(
      204,
    ),
});

export const nockNetWorthCategory = makeAuthCrudNocks('data/net-worth/categories', CATEGORY_CASH);

export const nockNetWorthSubcategory = makeAuthCrudNocks(
  'data/net-worth/subcategories',
  SUBCATEGORY_WALLET,
);

export const nockNetWorthEntry = makeAuthCrudNocks('data/net-worth', ENTRY_BANK_HOUSE_RAW);
