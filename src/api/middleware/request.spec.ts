import Joi from '@hapi/joi';
import { getMockReq, getMockRes } from '@jest-mock/express';
import type { DatabaseTransactionConnectionType } from 'slonik';

import { validatedAuthDbRoute } from './request';

import * as db from '~api/modules/db';

jest.setTimeout(500);

describe('validatedAuthDbRoute', () => {
  let myTrx: DatabaseTransactionConnectionType;
  let myHandler: jest.Mock;
  let executionPromise: Promise<void>;
  let nextErr: jest.Mock;

  beforeEach(() => {
    let executionResolver: () => void;
    let executionRejecter: (reason?: unknown) => void;
    executionPromise = new Promise<void>((resolve, reject) => {
      executionResolver = resolve;
      executionRejecter = reject;
    });

    myHandler = jest.fn(() => {
      executionResolver?.();
    });

    nextErr = jest.fn((err?: unknown) => {
      if (err) {
        executionRejecter?.(err);
      }
    });

    myTrx = {} as DatabaseTransactionConnectionType;

    jest.spyOn(db, 'withSlonik').mockImplementation(
      (handler) =>
        (...args): ReturnType<typeof handler> =>
          handler(myTrx, ...args),
    );
  });

  it('should run a handler with a valid request', async () => {
    expect.assertions(2);

    const myRoute = validatedAuthDbRoute({}, myHandler);

    const req = getMockReq();
    const { res, next } = getMockRes();

    myRoute(req, res, next);
    await executionPromise;

    expect(myHandler).toHaveBeenCalledTimes(1);
    expect(myHandler).toHaveBeenCalledWith(myTrx, req, res, undefined, undefined, undefined);
  });

  describe('data validation', () => {
    let myRoute: ReturnType<typeof validatedAuthDbRoute>;
    beforeEach(() => {
      myRoute = validatedAuthDbRoute(
        {
          data: Joi.object({
            foo: Joi.number(),
          }),
        },
        myHandler,
      );
    });

    it('should pass valid data through', async () => {
      expect.assertions(2);

      const req = getMockReq({
        body: {
          foo: '1.562',
        },
      });

      const { res } = getMockRes();

      myRoute(req, res, nextErr);
      await executionPromise;

      expect(myHandler).toHaveBeenCalledTimes(1);
      expect(myHandler).toHaveBeenCalledWith(
        myTrx,
        req,
        res,
        {
          foo: 1.562,
        },
        undefined,
        undefined,
      );
    });

    it('should throw an error when data is invalid', async () => {
      expect.assertions(1);

      expect.assertions(2);

      const req = getMockReq({
        body: {
          foo: 'not-a-number',
        },
      });

      const { res } = getMockRes();

      myRoute(req, res, nextErr);

      await expect(executionPromise).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\\"foo\\" must be a number"`,
      );

      expect(myHandler).not.toHaveBeenCalled();
    });
  });

  describe('params validation', () => {
    let myRoute: ReturnType<typeof validatedAuthDbRoute>;
    beforeEach(() => {
      myRoute = validatedAuthDbRoute(
        {
          params: Joi.object({
            bar: Joi.string().valid('baz'),
          }),
        },
        myHandler,
      );
    });

    it('should pass valid params through', async () => {
      expect.assertions(2);

      const req = getMockReq({
        params: {
          bar: 'baz',
        },
      });

      const { res } = getMockRes();

      myRoute(req, res, nextErr);
      await executionPromise;

      expect(myHandler).toHaveBeenCalledTimes(1);
      expect(myHandler).toHaveBeenCalledWith(
        myTrx,
        req,
        res,
        undefined,
        {
          bar: 'baz',
        },
        undefined,
      );
    });

    it('should throw an error when params are invalid', async () => {
      expect.assertions(1);

      expect.assertions(2);

      const req = getMockReq({
        params: {
          bar: 'not-baz',
        },
      });

      const { res } = getMockRes();

      myRoute(req, res, nextErr);

      await expect(executionPromise).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\\"bar\\" must be [baz]"`,
      );

      expect(myHandler).not.toHaveBeenCalled();
    });
  });

  describe('query validation', () => {
    let myRoute: ReturnType<typeof validatedAuthDbRoute>;
    beforeEach(() => {
      myRoute = validatedAuthDbRoute(
        {
          query: Joi.object({
            baz: Joi.bool().truthy('yes', 'y').falsy('no', 'n'),
          }),
        },
        myHandler,
      );
    });

    it('should pass a valid query through', async () => {
      expect.assertions(2);

      const req = getMockReq({
        query: {
          baz: 'yes',
        },
      });

      const { res } = getMockRes();

      myRoute(req, res, nextErr);
      await executionPromise;

      expect(myHandler).toHaveBeenCalledTimes(1);
      expect(myHandler).toHaveBeenCalledWith(myTrx, req, res, undefined, undefined, {
        baz: true,
      });
    });

    it('should throw an error when the query is invalid', async () => {
      expect.assertions(1);

      expect.assertions(2);

      const req = getMockReq({
        query: {
          baz: 'phuc',
        },
      });

      const { res } = getMockRes();

      myRoute(req, res, nextErr);

      await expect(executionPromise).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\\"baz\\" must be a boolean"`,
      );

      expect(myHandler).not.toHaveBeenCalled();
    });
  });
});
