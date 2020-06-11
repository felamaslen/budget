import { processMultipleTasks } from '~api/controllers';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { multipleUpdateSchema } from '~api/schema';
import { MultiTask } from '~api/types';

export const routePatch = validatedAuthDbRoute<{ list: MultiTask[] }>(
  {
    data: multipleUpdateSchema,
  },
  async (db, req, res, { list: taskList }) => {
    const data = await processMultipleTasks(db, req.user.uid, taskList);
    res.json({ data });
  },
);
