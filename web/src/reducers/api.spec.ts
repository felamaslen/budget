import { dataRead, loggedOut, ActionTypeApi, ActionTypeLogin } from '~client/actions';
import reducer, { initialState } from '~client/reducers/api';
import { testResponse } from '~client/test-data';

describe('API reducer', () => {
  describe(ActionTypeLogin.LoggedOut, () => {
    it('should reset the state', () => {
      expect.assertions(1);
      expect(reducer(undefined, loggedOut())).toBe(initialState);
    });
  });

  describe(ActionTypeApi.DataRead, () => {
    const action = dataRead(testResponse);
    const state = { ...initialState, initialLoading: true };

    it.each`
      prop            | key            | value
      ${'birth date'} | ${'birthDate'} | ${new Date('1996-02-03')}
    `('should set the $prop app config property', ({ key, value }) => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          appConfig: expect.objectContaining({
            [key]: value,
          }),
        }),
      );
    });
  });
});
