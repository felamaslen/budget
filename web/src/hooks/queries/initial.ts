import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useInitialQuery } from '../gql';
import { dataRead, errorOpened } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import { getHistoryOptions } from '~client/selectors';

export function useInitialData(): boolean {
  const dispatch = useDispatch();

  const historyOptions = useSelector(getHistoryOptions);

  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  const [{ data, fetching, error }] = useInitialQuery({
    variables: {
      fundPeriod: historyOptions.period,
      fundLength: historyOptions.length,
    },
    pause: hasLoaded,
  });

  const errorMessage = error?.message;
  useEffect(() => {
    if (errorMessage) {
      dispatch(errorOpened(`Error loading data: ${errorMessage}`, ErrorLevel.Fatal));
    }
  }, [dispatch, errorMessage]);

  useEffect(() => {
    if (data && !fetching) {
      dispatch(dataRead(data));
      setHasLoaded(true);
    } else {
      setHasLoaded(false);
    }
  }, [dispatch, data, fetching]);

  return fetching || !hasLoaded;
}
