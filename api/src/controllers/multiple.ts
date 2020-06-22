import { DatabaseTransactionConnectionType } from 'slonik';
import { createFund, updateFund } from './funds';
import { createListData, updateListData, deleteListData } from './list';
import { MultiTask, CreateResponse, UpdateResponse, DeleteResponse, Page } from '~api/types';

type AnyResponse = CreateResponse | UpdateResponse | DeleteResponse;

const processSingleTask = (db: DatabaseTransactionConnectionType, uid: number) => async (
  task: MultiTask,
): Promise<AnyResponse> => {
  if (task.method === 'delete') {
    return deleteListData(db, uid, task.route, task.body.id);
  }

  switch (task.route) {
    case Page.funds:
      switch (task.method) {
        case 'post':
          return createFund(db, uid, task.body);
        case 'put':
          return updateFund(db, uid, task.body);
        default:
          throw new Error('Unrecognised method');
      }

    default:
      switch (task.method) {
        case 'post':
          return createListData(db, uid, task.route, task.body);
        case 'put':
          return updateListData(db, uid, task.route, task.body);
        default:
          throw new Error('Unrecognised method');
      }
  }
};

export async function processMultipleTasks(
  db: DatabaseTransactionConnectionType,
  uid: number,
  list: MultiTask[],
): Promise<AnyResponse[]> {
  return Promise.all<AnyResponse>(list.map(processSingleTask(db, uid)));
}
