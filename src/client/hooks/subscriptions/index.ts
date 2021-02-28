import { useAppConfig } from '../config';
import { useFundsSubscriptions } from './funds';
import { useListSubscriptions } from './list';
import { useNetWorthSubscriptions } from './net-worth';

export function useSubscriptions(): void {
  useAppConfig();
  useFundsSubscriptions();
  useListSubscriptions();
  useNetWorthSubscriptions();
}
