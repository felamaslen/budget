import React, { useCallback, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as Styled from './styles';
import { HeadProps } from './types';
import { fundsViewSoldToggled, fundsRequested } from '~client/actions';
import { ListHeadFunds, ListHeadFundsMobile } from '~client/components/list-head-funds';
import { TodayContext } from '~client/hooks';
import { getFundsCost, getViewSoldFunds, getPeriod, getFundsCachedValue } from '~client/selectors';

type Props = {
  isMobile: boolean;
} & HeadProps;

export const FundHeader: React.FC<Props> = ({ isMobile, sort, setSort }) => {
  const today = useContext(TodayContext);
  const totalCost = useSelector(getFundsCost(today));
  const viewSoldFunds = useSelector(getViewSoldFunds);
  const period = useSelector(getPeriod);
  const cachedValue = useSelector(getFundsCachedValue(today));

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
            sort={sort}
            setSort={setSort}
          />
        </Styled.FundHeader>
      )}
    </>
  );
};
