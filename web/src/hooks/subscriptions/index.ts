import { useFundsSubscriptions } from './funds';
import { useListSubscriptions } from './list';
import { useNetWorthSubscriptions } from './net-worth';

export function useSubscriptions(): void {
  useFundsSubscriptions();
  useListSubscriptions();
  useNetWorthSubscriptions();
}
