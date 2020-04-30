import reducer, { initialState, State } from '~client/reducers/error';
import { errorOpened, errorClosed, errorRemoved } from '~client/actions/error';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Error reducer', () => {
  it('should return the initial state on null action', () => {
    expect(reducer(undefined, null)).toBe(initialState);
  });

  describe('ERROR_OPENED', () => {
    const state: State = [];
    const action = errorOpened('some message', 3);

    it('should add a message to the list', () => {
      const result = reducer(state, action);
      expect(result).toEqual([
        {
          id: 'some-fake-id',
          message: {
            text: 'some message',
            level: 3,
          },
        },
      ]);
    });
  });

  describe('ERROR_CLOSED', () => {
    const state: State = [{ id: 'some_id', message: { text: 'some message', level: 1 } }];
    const action = errorClosed('some_id');

    it('should hide a message', () => {
      const result = reducer(state, action);

      expect(result).toEqual([
        { id: 'some_id', message: { text: 'some message', level: 1 }, closed: true },
      ]);
    });
  });

  describe('ERROR_REMOVED', () => {
    const state: State = [
      { id: 'some_id', message: { text: 'some message', level: 1 }, closed: true },
    ];
    const action = errorRemoved('some_id');

    it('should remove a message', () => {
      const result = reducer(state, action);

      expect(result).toEqual([]);
    });
  });
});
