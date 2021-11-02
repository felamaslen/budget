import { CombinedError, makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import { useInitialData } from './initial';

import { dataRead, errorOpened } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import { testResponse } from '~client/test-data';
import { mockClient, renderHookWithStore } from '~client/test-utils';

jest.mock('shortid', () => ({
  generate: (): string => 'my-short-id',
}));

jest.mock('~client/modules/ssr', () => ({
  isServerSide: false,
}));

describe(useInitialData.name, () => {
  let querySpy: jest.SpyInstance;
  beforeEach(() => {
    querySpy = jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) =>
      fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: testResponse,
      }),
    );
  });

  it('should dispatch a data read action after reading data', () => {
    expect.assertions(1);
    const { store } = renderHookWithStore(useInitialData);
    expect(store.getActions()).toStrictEqual([dataRead(testResponse)]);
  });

  describe('when an error occurs', () => {
    const testError = new CombinedError({
      networkError: new Error('It broke!'),
    });
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      querySpy.mockReturnValueOnce(
        fromValue({
          error: testError,
        }),
      );

      consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    it('should dispatch a fatal error action when an error occurs', () => {
      expect.assertions(2);

      const { store } = renderHookWithStore(useInitialData);

      expect(store.getActions()).toStrictEqual([
        errorOpened('Error loading data: [Network] It broke!', ErrorLevel.Fatal),
      ]);

      expect(consoleSpy).toHaveBeenCalledWith('Error loading data', testError);
    });

    it('should not log to the console when NODE_ENV is production', () => {
      expect.assertions(1);
      const nodeEnvBefore = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      renderHookWithStore(useInitialData);

      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = nodeEnvBefore;
    });
  });
});
