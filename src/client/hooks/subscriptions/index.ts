import { useAppConfig } from '../config';
import { useFundsSubscriptions } from './funds';
import { useListSubscriptions } from './list';
import { useNetWorthSubscriptions } from './net-worth';

import { composeWithoutArgs } from '~client/modules/compose-without-args';

export function useSubscriptions(): () => void {
  const onReconnectConfig = useAppConfig();
  const onReconnectFunds = useFundsSubscriptions();
  const onReconnectList = useListSubscriptions();
  const onReconnectNetWorth = useNetWorthSubscriptions();

  return composeWithoutArgs(
    onReconnectConfig,
    onReconnectFunds,
    onReconnectList,
    onReconnectNetWorth,
  );
}
