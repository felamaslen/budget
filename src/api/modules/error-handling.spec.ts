import Boom from '@hapi/boom';
import { getMockReq, getMockRes } from '@jest-mock/express';

import { errorHandler } from './error-handling';
import logger from './logger';

describe(errorHandler.name, () => {
  describe.each`
    case             | err                  | statusCode
    ${'not found'}   | ${Boom.notFound()}   | ${404}
    ${'bad request'} | ${Boom.badRequest()} | ${400}
    ${'bad gateway'} | ${Boom.badGateway()} | ${502}
  `('when the error is a boom $case error', ({ err, statusCode }) => {
    it('should set the status code from the error', () => {
      expect.assertions(1);
      const req = getMockReq();
      const { res, next } = getMockRes();
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCode);
    });
  });

  describe('when the error is unhandled', () => {
    const myError = new Error('Something bad happened');

    it('should set the status code to 500', () => {
      expect.assertions(1);
      const req = getMockReq();
      const { res, next } = getMockRes();
      errorHandler(myError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should log the error', () => {
      expect.assertions(1);
      const req = getMockReq();
      const { res, next } = getMockRes();
      const loggerSpy = jest.spyOn(logger, 'warn');
      errorHandler(myError, req, res, next);

      expect(loggerSpy).toHaveBeenCalledWith('Unhandled API error: %s', myError.stack);
    });
  });
});
