import boom from '@hapi/boom';
import { Response, NextFunction } from 'express';
import Knex from 'knex';

import ResponseMultiple from '../responseMultiple';
import config, { Config } from '~api/config';
import { AuthenticatedRequest } from '~api/modules/auth';
import db from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';
import * as bills from '~api/routes/data/bills';
import * as food from '~api/routes/data/food';
import * as funds from '~api/routes/data/funds';
import * as general from '~api/routes/data/general';
import * as holiday from '~api/routes/data/holiday';
import * as income from '~api/routes/data/income';
import * as social from '~api/routes/data/social';
import { ListCategory } from '~api/types';

type Task = {
  route: ListCategory;
  method: 'post' | 'put' | 'delete';
  query?: object;
  body?: object;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateTaskList(list: any | Task[]): list is Task[] {
  if (!Array.isArray(list)) {
    return false;
  }

  return list.reduce((status, task) => {
    if (!status) {
      return false;
    }

    return (
      'route' in task &&
      typeof task.route === 'string' &&
      'method' in task &&
      typeof task.method === 'string' &&
      'query' in task &&
      typeof task.query === 'object' &&
      'body' in task &&
      typeof task.body === 'object'
    );
  }, true);
}

export function getOverallStatusCode(results: Pick<ResponseMultiple, 'statusCode'>[]): number {
  if (!results.length) {
    return 200;
  }

  const statusCode = results.reduce<number>((status, taskRes) => {
    // use the following status codes, in order of precedence
    if (taskRes.statusCode >= 500) {
      // server error
      if (status >= 500 && status !== taskRes.statusCode) {
        return 500;
      }

      return taskRes.statusCode;
    }
    if (status < 500 && taskRes.statusCode >= 400) {
      // client error
      if (status >= 400 && status !== taskRes.statusCode) {
        return 400;
      }

      return taskRes.statusCode;
    }
    if (status < 400 && taskRes.statusCode < 300 && taskRes.statusCode >= 200) {
      // success code
      if (status >= 200 && status !== taskRes.statusCode) {
        return 200;
      }

      return taskRes.statusCode;
    }

    return status;
  }, 0);

  return statusCode || 500;
}

type CustomRequestHandler = (
  config: Config,
  db: Knex,
) => <Req, Res>(req: Req, res: Res, next?: NextFunction) => Promise<Res>;

export const listDataProcessor: {
  [route in ListCategory]: {
    routePost: CustomRequestHandler;
    routeGet: CustomRequestHandler;
    routePut: CustomRequestHandler;
    routeDelete: CustomRequestHandler;
  };
} = {
  income,
  bills,
  funds,
  food,
  general,
  social,
  holiday,
};

export const routePatch = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const taskList = req.body?.list;

    if (!validateTaskList(taskList)) {
      res.status(400);
      res.json({
        errorMessage: 'Must provide a list of tasks',
      });
      return;
    }

    try {
      const allResults = await Promise.all(
        taskList.map<Promise<ResponseMultiple>>(({ route, method, query, body }) => {
          const taskReq = { ...req, query, body } as AuthenticatedRequest;
          const taskRes = new ResponseMultiple();

          if (!(route in listDataProcessor)) {
            throw boom.badRequest('Unrecognised route');
          }

          const processor = listDataProcessor[route];

          if (method === 'post') {
            return processor.routePost(config, db)(taskReq, taskRes);
          }

          if (method === 'put') {
            return processor.routePut(config, db)(taskReq, taskRes);
          }

          if (method === 'delete') {
            return processor.routeDelete(config, db)(taskReq, taskRes);
          }

          throw boom.badRequest('Unrecognised method');
        }),
      );

      const data = allResults.map(({ result }) => result);

      const error = allResults.reduce((status, { result }) => status || result.error, false);

      const statusCode = getOverallStatusCode(allResults);

      res.status(statusCode);
      res.json({ error, data });
    } catch (err) {
      res.status(400);
      res.json({ errorMessage: err.message });
    }
  },
);
