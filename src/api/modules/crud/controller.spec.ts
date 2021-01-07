import { DatabaseTransactionConnectionType } from 'slonik';

import { makeCrudController } from './controller';
import * as queries from './queries';

import * as pubsub from '~api/modules/graphql/pubsub';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { Create } from '~api/types';

jest.mock('./queries');
jest.mock('~api/modules/graphql/pubsub');

describe('Crud controller', () => {
  const db = {} as DatabaseTransactionConnectionType;

  describe(makeCrudController.name, () => {
    const table = 'my_table';
    const item = 'MyItem';

    const dbMap = [{ external: 'someProperty', internal: 'internal_property_name' }];

    type MyItemRow = {
      id: number;
      internal_property_name: string;
      something: number;
    };

    type MyItem = {
      id: number;
      someProperty: string;
      something: number;
    };

    const myController = makeCrudController<MyItemRow, MyItem>({
      table,
      item,
      jsonToDb: mapExternalToInternal(dbMap as DJMap<Create<MyItemRow>>),
      dbToJson: mapInternalToExternal(dbMap as DJMap<MyItemRow>),
      withUid: false,
      createTopic: 'MY_ITEM_CREATED',
      updateTopic: 'MY_ITEM_UPDATED',
      deleteTopic: 'MY_ITEM_DELETED',
    });

    const testUserId = 891;

    describe(myController.create.name, () => {
      const setup = async (): Promise<{ spy: jest.SpyInstance; result: MyItem }> => {
        const spy = jest.spyOn(queries, 'insertCrudItem').mockResolvedValueOnce({
          id: 12,
          internal_property_name: 'thing',
          something: 99,
        });

        const result = await myController.create(db, testUserId, {
          someProperty: 'thing',
          something: 99,
        });

        return { spy, result };
      };

      it('should create an item', async () => {
        expect.assertions(3);

        const { spy, result } = await setup();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(false, db, testUserId, table, {
          internal_property_name: 'thing',
          something: 99,
        });

        expect(result).toStrictEqual<MyItem>({
          id: 12,
          someProperty: 'thing',
          something: 99,
        });
      });

      it('should publish to the pubsub queue', async () => {
        expect.assertions(2);

        const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();
        await setup();

        expect(pubsubSpy).toHaveBeenCalledTimes(1);
        expect(pubsubSpy).toHaveBeenCalledWith(`MY_ITEM_CREATED.${testUserId}`, {
          item: {
            id: 12,
            someProperty: 'thing',
            something: 99,
          },
        });
      });
    });

    describe(myController.read.name, () => {
      it('should read a single item', async () => {
        expect.assertions(3);

        const readSpy = jest.spyOn(queries, 'selectCrudItem').mockResolvedValueOnce({
          id: 12,
          internal_property_name: 'thing',
          something: 99,
        });

        const result = await myController.read(db, testUserId, 12);

        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledWith(false, db, testUserId, table, 12);

        expect(result).toStrictEqual<MyItem[]>([
          {
            id: 12,
            someProperty: 'thing',
            something: 99,
          },
        ]);
      });

      it('should read all the items', async () => {
        expect.assertions(3);

        const readSpy = jest.spyOn(queries, 'selectAllCrudItems').mockResolvedValueOnce([
          {
            id: 12,
            internal_property_name: 'thing',
            something: 99,
          },
          {
            id: 13,
            internal_property_name: 'other thing',
            something: 82,
          },
        ]);

        const result = await myController.read(db, testUserId);

        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledWith(false, db, testUserId, table);

        expect(result).toStrictEqual<MyItem[]>([
          {
            id: 12,
            someProperty: 'thing',
            something: 99,
          },
          {
            id: 13,
            someProperty: 'other thing',
            something: 82,
          },
        ]);
      });
    });

    describe(myController.update.name, () => {
      const setup = async (): Promise<{ result: MyItem; spy: jest.SpyInstance }> => {
        const spy = jest.spyOn(queries, 'updateCrudItem').mockResolvedValueOnce({
          id: 12,
          internal_property_name: 'updated',
          something: 100,
        });

        const result = await myController.update(db, testUserId, 12, {
          someProperty: 'updated',
          something: 100,
        });

        return { result, spy };
      };

      it('should update an item', async () => {
        expect.assertions(3);

        const { result, spy } = await setup();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(false, db, testUserId, table, 12, {
          internal_property_name: 'updated',
          something: 100,
        });

        expect(result).toStrictEqual<MyItem>({
          id: 12,
          someProperty: 'updated',
          something: 100,
        });
      });

      it('should publish to the pubsub queue', async () => {
        expect.assertions(2);

        const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();
        await setup();

        expect(pubsubSpy).toHaveBeenCalledTimes(1);
        expect(pubsubSpy).toHaveBeenCalledWith(`MY_ITEM_UPDATED.${testUserId}`, {
          item: {
            id: 12,
            someProperty: 'updated',
            something: 100,
          },
        });
      });
    });

    describe(myController.delete.name, () => {
      const setup = async (): Promise<{ spy: jest.SpyInstance }> => {
        const spy = jest.spyOn(queries, 'deleteCrudItem').mockResolvedValueOnce(1);

        await myController.delete(db, testUserId, 12);

        return { spy };
      };

      it('should delete an item', async () => {
        expect.assertions(2);

        const { spy } = await setup();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(false, db, testUserId, table, 12);
      });

      describe('when the item does not exist', () => {
        it('should throw an error', async () => {
          expect.assertions(1);

          jest.spyOn(queries, 'deleteCrudItem').mockResolvedValueOnce(0);

          await expect(
            myController.delete(db, testUserId, 12),
          ).rejects.toThrowErrorMatchingInlineSnapshot(`"MyItem not found"`);
        });
      });

      it('should publish to the pubsub queue', async () => {
        expect.assertions(2);

        const pubsubSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();
        await setup();

        expect(pubsubSpy).toHaveBeenCalledTimes(1);
        expect(pubsubSpy).toHaveBeenCalledWith(`MY_ITEM_DELETED.${testUserId}`, {
          id: 12,
        });
      });
    });
  });
});
