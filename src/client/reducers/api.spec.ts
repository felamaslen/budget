import {
  ActionTypeApi,
  ActionTypeFunds,
  ActionTypeLogin,
  apiLoaded,
  apiLoading,
  configUpdatedFromApi,
  configUpdatedFromLocal,
  dataRead,
  fundQueryUpdated,
  loggedOut,
  settingsToggled,
} from '~client/actions';
import reducer, { initialState, State } from '~client/reducers/api';
import type { LocalAppConfig } from '~client/types';
import { FundMode, FundPeriod } from '~client/types/enum';

describe('aPI reducer', () => {
  describe(ActionTypeLogin.LoggedOut, () => {
    it('should reset the state', () => {
      expect.assertions(1);
      expect(reducer(undefined, loggedOut())).toBe(initialState);
    });
  });

  describe(ActionTypeApi.ConfigUpdatedFromApi, () => {
    const action = configUpdatedFromApi({
      birthDate: '1992-03-01',
      realTimePrices: false,
      fundMode: FundMode.Price,
    });
    const result = reducer(initialState, action);

    it('should set the updated config', () => {
      expect.assertions(1);
      expect(result.appConfig).toStrictEqual(
        expect.objectContaining<Partial<LocalAppConfig>>({
          birthDate: '1992-03-01',
          realTimePrices: false,
          fundMode: FundMode.Price,
        }),
      );
    });

    it('should not update the serial', () => {
      expect.assertions(1);
      expect(result.appConfigSerial).toBe(0);
    });
  });

  describe(ActionTypeApi.ConfigUpdatedFromLocal, () => {
    const action = configUpdatedFromLocal({
      birthDate: '1994-05-10',
      realTimePrices: false,
      historyOptions: {
        period: FundPeriod.Ytd,
        length: null,
      },
    });

    const result = reducer(initialState, action);

    it('should set the updated config (optimistically)', () => {
      expect.assertions(1);
      expect(result.appConfig).toStrictEqual(
        expect.objectContaining<Partial<State['appConfig']>>({
          birthDate: '1994-05-10',
          realTimePrices: false,
          historyOptions: {
            period: FundPeriod.Ytd,
            length: null,
          },
        }),
      );
    });

    it('should increment the serial', () => {
      expect.assertions(1);
      expect(result.appConfigSerial).toBe(initialState.appConfigSerial + 1);
    });
  });

  describe(ActionTypeApi.DataRead, () => {
    const action = dataRead({
      config: {
        birthDate: '1992-05-10',
        futureMonths: 17,
        realTimePrices: false,
        fundMode: FundMode.Roi,
        fundPeriod: FundPeriod.Ytd,
        fundLength: null,
      },
    });

    it('should set the app config', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.appConfig.birthDate).toBe('1992-05-10');
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

  describe(ActionTypeApi.SettingsOpenToggled, () => {
    describe.each`
      open
      ${true}
      ${false}
    `('when open is $open', ({ open }) => {
      const action = settingsToggled(open);

      it('should set the settings dialog open state', () => {
        expect.assertions(2);
        expect(reducer({ ...initialState, settingsOpen: false }, action).settingsOpen).toBe(open);
        expect(reducer({ ...initialState, settingsOpen: true }, action).settingsOpen).toBe(open);
      });
    });

    describe('when the status is not provided', () => {
      const action = settingsToggled();

      it('should toggle the settings dialog open state', () => {
        expect.assertions(2);
        expect(reducer({ ...initialState, settingsOpen: false }, action).settingsOpen).toBe(true);
        expect(reducer({ ...initialState, settingsOpen: true }, action).settingsOpen).toBe(false);
      });
    });
  });
});
