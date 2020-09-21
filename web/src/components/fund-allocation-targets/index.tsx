import React, { useEffect, useState, useCallback, useRef } from 'react';

import * as Styled from './styles';
import { colorKey } from '~client/modules/color';
import { VOID } from '~client/modules/data';
import { abbreviateFundName } from '~client/modules/finance';
import { formatCurrency } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import { Portfolio, PortfolioItem, Fund } from '~client/types';

const formatOptions = {
  brackets: true,
  abbreviate: true,
  noPence: true,
};

const minimumAdjustmentValue = 100000;

type Props = {
  funds: Fund[];
  portfolio: Portfolio;
  cashTarget: number;
  cashToInvest: number;
  onSetCashTarget: (value: number) => void;
  onSetFundTarget: (item: Fund, allocationTarget: number) => void;
};

type TargetProps = {
  fraction: number;
  color: string;
  isCash?: boolean;
  onSet: (deltaPixels: number) => void;
};

const Target: React.FC<TargetProps> = ({ fraction, color, onSet, isCash }) => {
  const [delta, setDelta] = useState<number>(0);
  const [dragPosition, setDragPosition] = useState<number | null>(null);

  const onActivate = useCallback((event: React.MouseEvent) => {
    setDragPosition(event.clientX);
  }, []);

  const onFinish = useCallback(() => {
    setDragPosition(null);
  }, []);

  useEffect(() => {
    if (dragPosition === null) {
      setDelta(0);
      return VOID;
    }

    const onMouseMove = (event: MouseEvent): void => {
      setDelta(event.clientX - dragPosition);
    };

    const onMouseUp = (event: MouseEvent): void => {
      const nextDelta = event.clientX - dragPosition;
      setDelta(nextDelta);
      onFinish();
      onSet(nextDelta);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return (): void => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragPosition, onFinish, onSet]);

  return (
    <Styled.Target
      fraction={Math.min(1, fraction)}
      delta={delta}
      color={color}
      onMouseDown={onActivate}
      isCash={isCash}
    />
  );
};

export const Adjustment: React.FC<{ title?: string; value: number; totalValue: number }> = ({
  title,
  value,
  totalValue,
}) => {
  const numAdjustments = Math.floor(Math.abs(value) / minimumAdjustmentValue);
  const direction = value > 0 ? 1 : -1;

  if (!numAdjustments) {
    return null;
  }

  const fraction = (minimumAdjustmentValue * numAdjustments) / totalValue;

  const label = title
    ? `${direction === 1 ? 'Buy' : 'Sell'} ${formatCurrency(
        numAdjustments * minimumAdjustmentValue,
        { abbreviate: true, noPence: true },
      )} of ${title} to adjust`
    : undefined;

  return (
    <Styled.Adjustment direction={direction} fraction={fraction} title={label}>
      {Array(numAdjustments)
        .fill(0)
        .map((_, index) => (
          <Styled.AdjustmentSection key={`adjustment-${index}`} />
        ))}
    </Styled.Adjustment>
  );
};

export const FundAllocationTargets: React.FC<Props> = ({
  funds,
  portfolio,
  cashToInvest,
  cashTarget,
  onSetCashTarget,
  onSetFundTarget,
}) => {
  const stockValue = portfolio.reduce<number>((last, { value }) => last + value, 0);
  const totalValue = stockValue + cashToInvest;

  const cashFractionActual = cashToInvest / totalValue;
  const cashFractionTarget = cashTarget / totalValue;
  const cashAdjustment = cashTarget - cashToInvest;

  const containerRef = useRef<HTMLDivElement>(null);

  const setCashTarget = useCallback(
    (deltaPixels: number): void => {
      const newCashTarget =
        Math.round(
          (cashTarget + (deltaPixels / (containerRef.current?.offsetWidth ?? 0)) * totalValue) /
            100000,
        ) * 100000;
      onSetCashTarget(newCashTarget);
    },
    [cashTarget, totalValue, onSetCashTarget],
  );

  const sortedPortfolio = portfolio
    .filter(({ value }) => value > 0)
    .sort((a, b) => b.value - a.value);

  const roundAndBound = (value: number): number =>
    Math.round(100 * Math.max(0.01, Math.min(value, 1))) / 100;

  const setFundTargets = useCallback(
    (id: number, previousTarget: number, deltaPixels: number): void => {
      const portfolioIndex = sortedPortfolio.findIndex((item) => item.id === id);
      const nextPortfolioItem = sortedPortfolio[portfolioIndex + 1];

      const nextTargetValue =
        previousTarget * stockValue +
        (deltaPixels / (containerRef.current?.offsetWidth ?? 0)) * totalValue;

      const thisFund = funds.find((item) => item.id === id);

      if (!nextPortfolioItem) {
        if (thisFund) {
          const nextAllocationTarget = roundAndBound(nextTargetValue / stockValue);
          onSetFundTarget(thisFund, nextAllocationTarget);
        }
        return;
      }

      const nextAllocationTarget = roundAndBound(
        Math.min(
          previousTarget + nextPortfolioItem.allocationTarget - 0.01,
          nextTargetValue / stockValue,
        ),
      );

      const adjacentAllocationTarget =
        nextPortfolioItem.allocationTarget + previousTarget - nextAllocationTarget;

      const adjacentFund = funds.find((item) => item.id === nextPortfolioItem.id);

      if (!(thisFund && adjacentFund)) {
        throw new Error('Could not find fund');
      }

      // run the decrease first, to ensure it doesn't exceed the max
      if (nextAllocationTarget > previousTarget) {
        onSetFundTarget(adjacentFund, adjacentAllocationTarget);
        onSetFundTarget(thisFund, nextAllocationTarget);
      } else {
        onSetFundTarget(thisFund, nextAllocationTarget);
        onSetFundTarget(adjacentFund, adjacentAllocationTarget);
      }
    },
    [funds, sortedPortfolio, onSetFundTarget, stockValue, totalValue],
  );

  return (
    <Styled.Container ref={containerRef}>
      <Styled.Actual fraction={cashFractionActual} color={colors.medium.dark}>
        <Styled.CashLabel>Cash</Styled.CashLabel>
        <Styled.CashLabelTarget>
          {formatCurrency(cashToInvest, formatOptions)} Actual /{' '}
          {formatCurrency(cashTarget, formatOptions)} Target
        </Styled.CashLabelTarget>
        <Adjustment value={cashAdjustment} totalValue={totalValue} />
      </Styled.Actual>
      <Target
        fraction={cashFractionTarget}
        color={colors.medium.dark}
        onSet={setCashTarget}
        isCash={true}
      />

      {sortedPortfolio
        .reduce<(PortfolioItem & { cumulativeTarget: number })[]>(
          (last, item) => [
            ...last,
            {
              ...item,
              cumulativeTarget:
                (last[last.length - 1]?.cumulativeTarget ?? 0) + item.allocationTarget,
            },
          ],
          [],
        )
        .map(({ id, item, value, cumulativeTarget, allocationTarget }) => (
          <React.Fragment key={id}>
            <Styled.Actual
              fraction={(value + cashFractionActual) / totalValue}
              color={colorKey(item)}
            >
              <span>{abbreviateFundName(item)}</span>
              <Adjustment
                title={abbreviateFundName(item)}
                totalValue={totalValue}
                value={allocationTarget * (totalValue - cashTarget) - value}
              />
            </Styled.Actual>

            <Target
              fraction={(cumulativeTarget * stockValue + cashTarget) / (stockValue + cashTarget)}
              color={colorKey(item)}
              onSet={(delta): void => setFundTargets(id, allocationTarget, delta)}
            />
          </React.Fragment>
        ))}
    </Styled.Container>
  );
};
