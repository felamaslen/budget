import { useDebounceCallback } from '@react-hook/debounce';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { configUpdated } from '~client/actions';
import { useConfigUpdatedSubscription, useSetConfigMutation } from '~client/hooks/gql';
import { getAppConfig, getAppConfigSerial } from '~client/selectors';

export function useAppConfig(): void {
  const dispatch = useDispatch();

  const [, setRemoteConfig] = useSetConfigMutation();
  const debouncedRemoteUpdate = useDebounceCallback(setRemoteConfig, 500);

  const [updatedConfigResult] = useConfigUpdatedSubscription();
  const updatedConfig = updatedConfigResult.data?.configUpdated;
  useEffect(() => {
    if (updatedConfig) {
      dispatch(configUpdated(updatedConfig));
    }
  }, [dispatch, updatedConfig]);

  const appConfig = useSelector(getAppConfig);
  const appConfigSerial = useSelector(getAppConfigSerial);
  const prevAppConfigSerial = useRef<number>(appConfigSerial);
  useEffect(() => {
    if (appConfigSerial !== prevAppConfigSerial.current) {
      prevAppConfigSerial.current = appConfigSerial;
      debouncedRemoteUpdate({
        config: {
          birthDate: appConfig.birthDate,
          fundPeriod: appConfig.historyOptions.period,
          fundLength: appConfig.historyOptions.length,
        },
      });
    }
  }, [appConfig, appConfigSerial, debouncedRemoteUpdate]);
}
