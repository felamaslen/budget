import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as Styled from './styles';
import { fundsViewSoldToggled, fundsRequested } from '~client/actions/funds';
import { ListHeadFunds, ListHeadFundsMobile } from '~client/components/ListHeadFunds';
import { getFundsCost, getViewSoldFunds, getPeriod, getFundsCachedValue } from '~client/selectors';

export const FundHeader: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const totalCost = useSelector(getFundsCost);
  const viewSoldFunds = useSelector(getViewSoldFunds);
  const period = useSelector(getPeriod);
  const cachedValue = useSelector(getFundsCachedValue);

  const dispatch = useDispatch();
  const onViewSoldToggle = useCallback(() => dispatch(fundsViewSoldToggled()), [dispatch]);
  const onReloadPrices = useCallback(() => dispatch(fundsRequested(false)), [dispatch]);

  return (
    <>
      {isMobile && (
        <ListHeadFundsMobile
          totalCost={totalCost}
          cachedValue={cachedValue}
          onReloadPrices={onReloadPrices}
        />
      )}
      {!isMobile && (
        <Styled.FundHeader data-testid="fund-header">
          <Styled.FundHeaderColumn column="item">Item</Styled.FundHeaderColumn>
          <Styled.FundHeaderColumn column="transactions">Transactions</Styled.FundHeaderColumn>
          <ListHeadFunds
            totalCost={totalCost}
            period={period}
            cachedValue={cachedValue}
            viewSoldFunds={viewSoldFunds}
            onViewSoldToggle={onViewSoldToggle}
            onReloadPrices={onReloadPrices}
          />
        </Styled.FundHeader>
      )}
    </>
  );
};
