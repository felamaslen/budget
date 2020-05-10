import * as boom from '@hapi/boom';
import joi, { Schema } from 'joi';
import { RequestHandler, Request, NextFunction } from 'express';

export const validate = (schema: Schema): RequestHandler => (
  req: Request,
  _,
  next: NextFunction,
): void => {
  const { error, value } = joi.validate(req.body, schema);
  if (error) {
    throw boom.badRequest(error.message);
  }

  req.body = value;

  next();
};
