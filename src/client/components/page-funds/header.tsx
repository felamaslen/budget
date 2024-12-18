import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as Styled from './styles';
import { fundsViewSoldToggled } from '~client/actions';
import { ListHeadFunds, ListHeadFundsMobile } from '~client/components/list-head-funds';
import { useNow, useToday } from '~client/hooks';
import {
  getAnnualisedFundReturns,
  getFundsCachedValue,
  getFundsCost,
  getHistoryOptions,
  getViewSoldFunds,
} from '~client/selectors';

type Props = {
  isMobile: boolean;
};

export const FundHeader: React.FC<Props> = ({ isMobile }) => {
  const today = useToday();
  const now = useNow();
  const totalCost = useSelector(getFundsCost(today));
  const viewSoldFunds = useSelector(getViewSoldFunds);
  const historyOptions = useSelector(getHistoryOptions);
  const annualisedFundReturns = useSelector(getAnnualisedFundReturns);
  const cachedValue = useSelector(getFundsCachedValue.now(now));

  const dispatch = useDispatch();
  const onViewSoldToggle = useCallback(() => dispatch(fundsViewSoldToggled()), [dispatch]);

  return (
    <>
      {isMobile && (
        <ListHeadFundsMobile
          totalCost={totalCost}
          annualisedFundReturns={annualisedFundReturns}
          cachedValue={cachedValue}
        />
      )}
      {!isMobile && (
        <Styled.FundHeader data-testid="fund-header">
          <Styled.FundHeaderColumn column="item">Item</Styled.FundHeaderColumn>
          <Styled.FundHeaderColumn column="transactions">Transactions</Styled.FundHeaderColumn>
          <ListHeadFunds
            totalCost={totalCost}
            annualisedFundReturns={annualisedFundReturns}
            historyOptions={historyOptions}
            cachedValue={cachedValue}
            viewSoldFunds={viewSoldFunds}
            onViewSoldToggle={onViewSoldToggle}
          />
        </Styled.FundHeader>
      )}
    </>
  );
};
