import {
  ActionTypeApi,
  ActionTypeFunds,
  ActionTypeLogin,
  apiLoaded,
  apiLoading,
  configUpdated,
  fundQueryUpdated,
  loggedOut,
} from '~client/actions';
import reducer, { initialState } from '~client/reducers/api';
import { FundPeriod } from '~client/types/enum';

describe('API reducer', () => {
  describe(ActionTypeLogin.LoggedOut, () => {
    it('should reset the state', () => {
      expect.assertions(1);
      expect(reducer(undefined, loggedOut())).toBe(initialState);
    });
  });

  describe(ActionTypeApi.ConfigUpdated, () => {
    const action = configUpdated({ birthDate: '1992-03-01' });
    const result = reducer(initialState, action);

    it('should set the updated config', () => {
      expect.assertions(1);
      expect(result.appConfig).toStrictEqual(
        expect.objectContaining({
          birthDate: '1992-03-01',
        }),
      );
    });

    it('should not update the serial', () => {
      expect.assertions(1);
      expect(result.appConfigSerial).toBe(0);
    });
  });

  describe(ActionTypeApi.Loading, () => {
    it('should increment the loading counter', () => {
      expect.assertions(1);
      const result = reducer({ ...initialState, loading: 3 }, apiLoading);
      expect(result.loading).toBe(4);
    });
  });

  describe(ActionTypeApi.Loaded, () => {
    it('should decrement the loading counter', () => {
      expect.assertions(1);
      const result = reducer({ ...initialState, loading: 3 }, apiLoaded);
      expect(result.loading).toBe(2);
    });
  });

  describe(ActionTypeFunds.QueryUpdated, () => {
    const action = fundQueryUpdated({
      period: FundPeriod.Year,
      length: 7,
    });

    it('should set the query', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.appConfig).toStrictEqual(
        expect.objectContaining({
          historyOptions: { period: FundPeriod.Year, length: 7 },
        }),
      );
    });

    it('should update the config serial', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.appConfigSerial).toBe(1);
    });
  });
});
