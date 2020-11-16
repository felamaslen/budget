import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';

import * as Styled from './styles';
import { colorKey } from '~client/modules/color';
import { VOID } from '~client/modules/data';
import { abbreviateFundName } from '~client/modules/finance';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import { Portfolio, PortfolioItem, Fund } from '~client/types';

const minimumAdjustmentValue = 100000;

type Props = {
  funds: Fund[];
  portfolio: Portfolio;
  cashTarget: number;
  cashToInvest: number;
  onSetCashTarget: (value: number) => void;
  onSetFundTarget: (item: Fund, allocationTarget: number) => void;
};

type SetPreview = (preview: string | null) => void;

type TargetProps = Pick<Props, 'funds' | 'onSetFundTarget' | 'onSetCashTarget'> & {
  fraction: number;
  color: string;
  isCash?: boolean;
  setPreview: SetPreview;
  containerWidth: number;
  sortedPortfolio: Portfolio;
  id?: number;
  allocationTarget: number;
  stockValue: number;
  totalValue: number;
};

type TargetDelta = {
  fund: Fund;
  allocationTarget: number;
};

const formatOptions = { abbreviate: true, noPence: true };

const roundAndBound = (value: number): number =>
  Math.round(100 * Math.max(0.01, Math.min(value, 1))) / 100;

const Target: React.FC<TargetProps> = ({
  fraction,
  color,
  isCash,
  onSetFundTarget,
  onSetCashTarget,
  setPreview,
  containerWidth,
  sortedPortfolio,
  funds,
  id,
  allocationTarget,
  stockValue,
  totalValue,
}) => {
  const [delta, setDelta] = useState<number>(0);
  const [dragPosition, setDragPosition] = useState<number | null>(null);

  const getFundTargetFromDelta = useCallback(
    (deltaPixels: number): { deltas: TargetDelta[]; reverse: boolean } => {
      const portfolioIndex = sortedPortfolio.findIndex((item) => item.id === id);
      const nextPortfolioItem = sortedPortfolio[portfolioIndex + 1];

      const nextTargetValue =
        allocationTarget * stockValue + (deltaPixels / containerWidth) * totalValue;

      const thisFund = funds.find((item) => item.id === id);

      if (!nextPortfolioItem) {
        if (thisFund) {
          const nextAllocationTarget = roundAndBound(nextTargetValue / stockValue);
          return {
            deltas: [
              {
                fund: thisFund,
                allocationTarget: nextAllocationTarget,
              },
            ],
            reverse: false,
          };
        }
        return { deltas: [], reverse: false };
      }

      const nextAllocationTarget = roundAndBound(
        Math.min(
          allocationTarget + nextPortfolioItem.allocationTarget - 0.01,
          nextTargetValue / stockValue,
        ),
      );

      const adjacentAllocationTarget =
        nextPortfolioItem.allocationTarget + allocationTarget - nextAllocationTarget;

      const adjacentFund = funds.find((item) => item.id === nextPortfolioItem.id);

      if (!(thisFund && adjacentFund)) {
        throw new Error('Could not find fund');
      }

      // run the decrease first, to ensure it doesn't exceed the max
      const thisDelta: TargetDelta = { fund: thisFund, allocationTarget: nextAllocationTarget };
      const adjacentDelta: TargetDelta = {
        fund: adjacentFund,
        allocationTarget: adjacentAllocationTarget,
      };

      const reverse = nextAllocationTarget > allocationTarget;
      return {
        deltas: reverse ? [adjacentDelta, thisDelta] : [thisDelta, adjacentDelta],
        reverse,
      };
    },
    [containerWidth, funds, sortedPortfolio, id, stockValue, totalValue, allocationTarget],
  );

  const setFundTargets = useCallback(
    (deltaPixels: number): void => {
      const { deltas: targetDelta } = getFundTargetFromDelta(deltaPixels);
      targetDelta.forEach((fundDelta) => {
        onSetFundTarget(fundDelta.fund, fundDelta.allocationTarget);
      });
    },
    [onSetFundTarget, getFundTargetFromDelta],
  );

  const getCashTargetFromDelta = useCallback(
    (deltaPixels: number): number =>
      Math.round((allocationTarget + (deltaPixels / containerWidth) * totalValue) / 100000) *
      100000,
    [containerWidth, allocationTarget, totalValue],
  );

  const setCashTarget = useCallback(
    (deltaPixels: number): void => {
      onSetCashTarget(getCashTargetFromDelta(deltaPixels));
    },
    [onSetCashTarget, getCashTargetFromDelta],
  );

  const onActivate = useCallback((event: React.MouseEvent) => {
    setDragPosition(event.clientX);
  }, []);
  const onTouchStart = useCallback((event: React.TouchEvent) => {
    setDragPosition(event.touches[0]?.clientX ?? null);
  }, []);

  const onFinish = useCallback(() => {
    setDragPosition(null);
  }, []);

  useEffect(() => {
    if (dragPosition === null) {
      setDelta(0);
      return VOID;
    }

    const move = (clientX: number): void => {
      const nextDelta = clientX - dragPosition;
      setDelta(nextDelta);
      if (isCash) {
        const nextTarget = getCashTargetFromDelta(nextDelta);
        setPreview(`Cash target: ${formatCurrency(nextTarget, formatOptions)}`);
      } else {
        const { deltas, reverse } = getFundTargetFromDelta(nextDelta);
        const nextPreview = deltas.length
          ? (reverse ? deltas.reverse() : deltas)
              .map(
                (nextTarget) =>
                  `${abbreviateFundName(nextTarget.fund.item)}: ${formatPercent(
                    nextTarget.allocationTarget,
                  )}`,
              )
              .join(' / ')
          : null;

        setPreview(nextPreview);
      }
    };

    const onMouseMove = (event: MouseEvent): void => move(event.clientX);
    const onTouchMove = (event: TouchEvent): void => {
      if (event.touches.length) {
        move(event.touches[0].clientX);
      }
    };

    const deactivate = (clientX: number): void => {
      const nextDelta = clientX - dragPosition;
      setDelta(nextDelta);
      onFinish();
      if (isCash) {
        setCashTarget(nextDelta);
      } else {
        setFundTargets(nextDelta);
      }
      setPreview(null);
    };

    const onMouseUp = (event: MouseEvent): void => deactivate(event.clientX);
    const onTouchEnd = (event: TouchEvent): void => {
      if (event.changedTouches.length) {
        deactivate(event.changedTouches[0].clientX);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return (): void => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [
    isCash,
    dragPosition,
    onFinish,
    setPreview,
    getCashTargetFromDelta,
    setCashTarget,
    getFundTargetFromDelta,
    setFundTargets,
  ]);

  return (
    <Styled.Target
      fraction={Math.min(1, fraction)}
      delta={delta}
      color={color}
      onMouseDown={onActivate}
      onTouchStart={onTouchStart}
      isCash={isCash}
    />
  );
};

function getAdjustmentLabel(title: string, direction: 1 | -1, formattedAdjustment: string): string {
  if (title === 'Cash') {
    return `${
      direction === 1
        ? `Raise ${formattedAdjustment} of cash`
        : `Buy ${formattedAdjustment} of stock`
    } to adjust`;
  }

  return `${direction === 1 ? 'Buy' : 'Sell'} ${formattedAdjustment} of ${title} to adjust`;
}

type AdjustmentProps = {
  title: string;
  value: number;
  totalValue: number;
  setPreview: SetPreview;
};

export const Adjustment: React.FC<AdjustmentProps> = ({ title, value, totalValue, setPreview }) => {
  const numAdjustments = Math.floor(Math.abs(value) / minimumAdjustmentValue);
  const direction = value > 0 ? 1 : -1;

  const fraction = (minimumAdjustmentValue * numAdjustments) / totalValue;
  const adjustment = numAdjustments * minimumAdjustmentValue;
  const formattedAdjustment = formatCurrency(adjustment, formatOptions);

  const label = getAdjustmentLabel(title, direction, formattedAdjustment);

  const onActivate = useCallback(() => setPreview(label), [setPreview, label]);
  const onBlur = useCallback(() => setPreview(null), [setPreview]);

  if (!numAdjustments) {
    return null;
  }

  return (
    <Styled.Adjustment
      direction={direction}
      fraction={fraction}
      onMouseOver={onActivate}
      onFocus={onActivate}
      onMouseOut={onBlur}
      onBlur={onBlur}
    >
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
  const containerWidth = containerRef.current?.offsetWidth ?? 0;

  const sortedPortfolio = useMemo(
    () => portfolio.filter(({ value }) => value > 0).sort((a, b) => b.value - a.value),
    [portfolio],
  );

  const [preview, setPreview] = useState<string | null>(null);

  return (
    <Styled.Container ref={containerRef}>
      <Styled.Actual fraction={cashFractionActual} color={colors.medium.dark}>
        <span>Cash</span>
        <Adjustment
          value={cashAdjustment}
          totalValue={totalValue}
          title="Cash"
          setPreview={setPreview}
        />
      </Styled.Actual>
      <Target
        containerWidth={containerWidth}
        funds={funds}
        sortedPortfolio={sortedPortfolio}
        onSetFundTarget={onSetFundTarget}
        onSetCashTarget={onSetCashTarget}
        stockValue={stockValue}
        totalValue={totalValue}
        setPreview={setPreview}
        fraction={cashFractionTarget}
        color={colors.medium.dark}
        isCash={true}
        allocationTarget={cashTarget}
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
              <span title={item}>{abbreviateFundName(item)}</span>
              <Adjustment
                totalValue={totalValue}
                value={allocationTarget * (totalValue - cashTarget) - value}
                setPreview={setPreview}
                title={abbreviateFundName(item)}
              />
            </Styled.Actual>

            <Target
              containerWidth={containerWidth}
              funds={funds}
              sortedPortfolio={sortedPortfolio}
              onSetFundTarget={onSetFundTarget}
              onSetCashTarget={onSetCashTarget}
              stockValue={stockValue}
              totalValue={totalValue}
              setPreview={setPreview}
              id={id}
              fraction={(cumulativeTarget * stockValue + cashTarget) / (stockValue + cashTarget)}
              color={colorKey(item)}
              allocationTarget={allocationTarget}
            />
          </React.Fragment>
        ))}

      {preview && <Styled.Preview>{preview}</Styled.Preview>}
    </Styled.Container>
  );
};
