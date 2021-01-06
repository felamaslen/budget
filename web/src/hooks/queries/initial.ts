import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useInitialQuery } from '../gql';
import { dataRead, errorOpened } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import { isServerSide } from '~client/modules/ssr';
import type { LocalAppConfig } from '~client/reducers/api';
import { getAppConfig } from '~client/selectors';
import { InitialQueryVariables } from '~client/types/gql';

export const getInitialQueryVariables = (appConfig: LocalAppConfig): InitialQueryVariables => ({
  fundPeriod: appConfig.historyOptions.period,
  fundLength: appConfig.historyOptions.length,
});

export function useInitialData(): { loading: boolean; error: string | undefined } {
  const dispatch = useDispatch();
  const appConfig = useSelector(getAppConfig);

  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  const [{ data, fetching, error }] = useInitialQuery({
    variables: getInitialQueryVariables(appConfig),
    pause: hasLoaded || isServerSide,
  });

  const errorMessage = error?.message;
  useEffect(() => {
    if (errorMessage) {
      dispatch(errorOpened(`Error loading data: ${errorMessage}`, ErrorLevel.Fatal));
    }
  }, [dispatch, errorMessage]);

  useEffect(() => {
    if (!isServerSide && data && !fetching) {
      dispatch(dataRead(data));
      setHasLoaded(true);
    } else {
      setHasLoaded(false);
    }
  }, [dispatch, data, fetching]);

  return { loading: fetching || !hasLoaded, error: errorMessage };
}
