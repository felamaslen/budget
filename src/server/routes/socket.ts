import { graphql } from 'graphql';

import schema from '~/server/schema';
import { SocketWithAuth } from '~/server/modules/socket';
import { QUERIED, ERRORED } from '~/constants/actions.rt';
import { QueryActionPayload } from '~/actions/types';

export default function socketRoutes(socket: SocketWithAuth): void {
  socket.on(
    QUERIED,
    async (data?: QueryActionPayload): Promise<void> => {
      if (!(data && data.query)) {
        return;
      }

      const result = await graphql(schema, data.query);

      if (result.errors) {
        result.errors.forEach(({ message }: { message: string }) => {
          socket.emit(ERRORED, {
            error: message,
          });
        });
      }

      const { data: results } = result;

      if (!results) {
        return;
      }

      Object.keys(results).forEach(key => {
        socket.emit(key, results[key]);
      });
    },
  );
}
