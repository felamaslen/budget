import { errorOpened, errorClosed, errorRemoved } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import reducer, { initialState, State } from '~client/reducers/error';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('error reducer', () => {
  describe('eRROR_OPENED', () => {
    const state: State = initialState;
    const action = errorOpened('some message', ErrorLevel.Err);

    it('should add a message to the list', () => {
      expect.assertions(1);
      const result = reducer(state, action);
      expect(result).toStrictEqual([
        {
          id: 'some-fake-id',
          message: {
            text: 'some message',
            level: ErrorLevel.Err,
          },
        },
      ]);
    });
  });

  describe('eRROR_CLOSED', () => {
    const state: State = [
      { id: 'some_id', message: { text: 'some message', level: ErrorLevel.Warn } },
    ];
    const action = errorClosed('some_id');

    it('should hide a message', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result).toStrictEqual([
        { id: 'some_id', message: { text: 'some message', level: ErrorLevel.Warn }, closed: true },
      ]);
    });
  });

  describe('eRROR_REMOVED', () => {
    const state: State = [
      { id: 'some_id', message: { text: 'some message', level: ErrorLevel.Debug }, closed: true },
    ];
    const action = errorRemoved('some_id');

    it('should remove a message', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result).toStrictEqual([]);
    });
  });
});
