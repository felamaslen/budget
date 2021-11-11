import { rem, rgba } from 'polished';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as Styled from './styles';
import { colorKey } from '~client/modules/color';
import { lastInArray, VOID } from '~client/modules/data';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import type { Portfolio, PortfolioItem, FundNative as Fund } from '~client/types';
import type { TargetDelta } from '~client/types/gql';
import { abbreviateFundName } from '~shared/abbreviation';

const minimumAdjustmentValue = 100000;

export type Props = {
  funds: Fund[];
  portfolio: Portfolio;
  cashTarget: number;
  cashToInvest: number;
  onSetCashTarget: (value: number) => void;
  onSetFundTargets: (deltas: TargetDelta[]) => void;
};

type SetPreview = (preview: string | null) => void;

type TargetProps = Pick<Props, 'funds' | 'onSetFundTargets' | 'onSetCashTarget'> & {
  fraction: number;
  color: string;
  isCash?: boolean;
  setPreview: SetPreview;
  containerWidth: number;
  sortedPortfolio: Portfolio;
  id?: number;
  cashTarget: number;
  allocationTarget: number;
  stockValue: number;
  totalValue: number;
  touchX: number | null;
  setTouchX: React.Dispatch<React.SetStateAction<number | null>>;
};

const formatOptions = { abbreviate: true, noPence: true };

const roundAndBound = (value: number): number => Math.round(Math.max(1, Math.min(value, 100)));

const labelDelta = (item: string, target: number): string =>
  `${abbreviateFundName(item)}: ${formatPercent(target / 100, { precision: 0 })}`;

type TargetState = { delta: number; dragPosition: number | null };

const Target: React.FC<TargetProps> = ({
  fraction,
  color,
  isCash,
  onSetFundTargets,
  onSetCashTarget,
  setPreview,
  containerWidth,
  sortedPortfolio,
  funds,
  id,
  cashTarget,
  allocationTarget,
  stockValue,
  totalValue,
  touchX,
  setTouchX,
}) => {
  const [state, setState] = useState<TargetState>({ delta: 0, dragPosition: null });

  const getFundTargetFromDelta = useCallback(
    (deltaPixels: number): { deltas: TargetDelta[]; description: string | null } => {
      const portfolioIndex = sortedPortfolio.findIndex((item) => item.id === id);
      const nextPortfolioItem = sortedPortfolio[portfolioIndex + 1];

      const nextTargetValue =
        (allocationTarget / 100) * stockValue +
        (deltaPixels / containerWidth) * (stockValue + cashTarget);

      const thisFund = funds.find((item) => item.id === id);

      if (!nextPortfolioItem) {
        if (thisFund) {
          const nextAllocationTarget = roundAndBound((100 * nextTargetValue) / stockValue);
          return {
            deltas: [
              {
                id: thisFund.id,
                allocationTarget: nextAllocationTarget,
              },
            ],
            description: labelDelta(thisFund.item, nextAllocationTarget),
          };
        }
        return { deltas: [], description: null };
      }

      const nextAllocationTarget = roundAndBound(
        Math.min(
          allocationTarget + nextPortfolioItem.allocationTarget - 1,
          (100 * nextTargetValue) / stockValue,
        ),
      );

      const adjacentAllocationTarget =
        nextPortfolioItem.allocationTarget + allocationTarget - nextAllocationTarget;

      const adjacentFund = funds.find((item) => item.id === nextPortfolioItem.id);

      if (!(thisFund && adjacentFund)) {
        throw new Error('Could not find fund');
      }

      const thisDelta: TargetDelta = { id: thisFund.id, allocationTarget: nextAllocationTarget };
      const adjacentDelta: TargetDelta = {
        id: adjacentFund.id,
        allocationTarget: adjacentAllocationTarget,
      };

      return {
        deltas: [thisDelta, adjacentDelta],
        description: `${labelDelta(thisFund.item, thisDelta.allocationTarget)} / ${labelDelta(
          adjacentFund.item,
          adjacentDelta.allocationTarget,
        )}`,
      };
    },
    [containerWidth, funds, sortedPortfolio, id, stockValue, cashTarget, allocationTarget],
  );

  const setFundTargets = useCallback(
    (deltaPixels: number): void => {
      const { deltas } = getFundTargetFromDelta(deltaPixels);
      onSetFundTargets(deltas);
    },
    [onSetFundTargets, getFundTargetFromDelta],
  );

  const getCashTargetFromDelta = useCallback(
    (deltaPixels: number): number =>
      Math.max(
        1,
        Math.round(
          (allocationTarget + (deltaPixels / containerWidth) * totalValue) / minimumAdjustmentValue,
        ),
      ) * minimumAdjustmentValue,
    [containerWidth, allocationTarget, totalValue],
  );

  const setCashTarget = useCallback(
    (deltaPixels: number): void => {
      onSetCashTarget(getCashTargetFromDelta(deltaPixels));
    },
    [onSetCashTarget, getCashTargetFromDelta],
  );

  const onMove = useCallback(
    (clientX: number | null): void => {
      if (clientX === null) {
        return;
      }
      const nextDelta = clientX - (state.dragPosition ?? clientX);
      setState((last) => ({ ...last, delta: nextDelta }));
      if (isCash) {
        const nextTarget = getCashTargetFromDelta(nextDelta);
        setPreview(`Cash target: ${formatCurrency(nextTarget, formatOptions)}`);
      } else {
        const { description } = getFundTargetFromDelta(nextDelta);
        setPreview(description);
      }
    },
    [state.dragPosition, getCashTargetFromDelta, getFundTargetFromDelta, isCash, setPreview],
  );

  const activate = useCallback(
    (clientX: number | null): void => {
      setState((last) => ({ ...last, dragPosition: clientX }));
      setTimeout(() => onMove(clientX), 0);
    },
    [onMove],
  );

  const deactivate = useCallback(
    (clientX: number): void => {
      const nextDelta = clientX - (state.dragPosition ?? 0);
      setState({ delta: nextDelta, dragPosition: null });
      setPreview(null);
      setTouchX(null);
      if (!nextDelta) {
        return;
      }
      if (isCash) {
        setCashTarget(nextDelta);
      } else {
        setFundTargets(nextDelta);
      }
    },
    [state.dragPosition, setCashTarget, setFundTargets, isCash, setPreview, setTouchX],
  );

  const onMouseDown = useCallback((event: React.MouseEvent) => activate(event.clientX), [activate]);
  const prevTouchX = useRef<number | null>(null);
  useEffect(() => {
    if (touchX === prevTouchX.current) {
      return;
    }
    prevTouchX.current = touchX;
    if (touchX === null) {
      deactivate(state.dragPosition ?? 0);
    } else {
      activate(touchX);
    }
  }, [touchX, activate, deactivate, state.dragPosition]);

  useEffect(() => {
    if (state.dragPosition === null) {
      setState((last) => ({ ...last, delta: 0 }));
      return VOID;
    }

    const onMouseMove = (event: MouseEvent): void => onMove(event.clientX);
    const onTouchMove = (event: TouchEvent): void => onMove(event.touches[0]?.clientX ?? null);

    const onMouseUp = (event: MouseEvent): void => deactivate(event.clientX);
    const onTouchEnd = (event: TouchEvent): void =>
      deactivate(event.changedTouches[0]?.clientX ?? null);

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
  }, [onMove, deactivate, state.dragPosition]);

  return (
    <Styled.Target
      data-testid={`target-${id ?? 'cash'}`}
      style={{
        borderColor: color,
        left: `${Math.min(1, fraction) * 100}%`,
        marginLeft: state.delta - 4,
      }}
      onMouseDown={onMouseDown}
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
      style={{
        width: rem(fraction * Styled.containerWidth),
      }}
      direction={direction}
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

type ActualProps = Styled.FractionProps & {
  color: string;
};

const Actual: React.FC<ActualProps> = ({ color, fraction, children }) => (
  <Styled.Actual
    style={{
      backgroundColor: rgba(color, 0.2),
      width: `${fraction * 100}%`,
    }}
    fraction={fraction}
  >
    {children}
  </Styled.Actual>
);

export const FundAllocationTargets: React.FC<Props> = ({
  funds,
  portfolio,
  cashToInvest,
  cashTarget,
  onSetCashTarget,
  onSetFundTargets,
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

  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = useCallback(
    (event: React.TouchEvent) => setTouchX(event.touches[0]?.clientX ?? null),
    [],
  );

  const touchNearestId = useMemo<number | 'cash' | null>(() => {
    if (touchX === null) {
      return null;
    }
    const touchOffset = touchX - (containerRef.current?.offsetLeft ?? 0);
    const cashDelta = Math.abs(touchOffset - (cashTarget / totalValue) * containerWidth);
    const nearest = sortedPortfolio.reduce<{ delta: number; sum: number; id: number | 'cash' }>(
      (last, { id, allocationTarget }) => {
        const nextSum = last.sum + (allocationTarget / 100) * (totalValue - cashTarget);
        const fundDelta = Math.abs(touchOffset - (nextSum / totalValue) * containerWidth);
        const nextDelta = Math.min(last.delta, fundDelta);
        const nextId = fundDelta < last.delta ? id : last.id;
        return { delta: nextDelta, sum: nextSum, id: nextId };
      },
      { delta: cashDelta, sum: cashTarget, id: 'cash' },
    );
    return nearest.id;
  }, [containerWidth, sortedPortfolio, touchX, cashTarget, totalValue]);

  return (
    <Styled.Container ref={containerRef} onTouchStart={onTouchStart}>
      <Actual fraction={cashFractionActual} color={colors.medium.dark}>
        <span>Cash</span>
        <Adjustment
          value={cashAdjustment}
          totalValue={totalValue}
          title="Cash"
          setPreview={setPreview}
        />
      </Actual>
      <Target
        containerWidth={containerWidth}
        funds={funds}
        sortedPortfolio={sortedPortfolio}
        onSetFundTargets={onSetFundTargets}
        onSetCashTarget={onSetCashTarget}
        stockValue={stockValue}
        totalValue={totalValue}
        setPreview={setPreview}
        fraction={cashFractionTarget}
        color={colors.medium.dark}
        isCash={true}
        cashTarget={cashTarget}
        allocationTarget={cashTarget}
        touchX={touchNearestId === 'cash' ? touchX : null}
        setTouchX={setTouchX}
      />

      {sortedPortfolio
        .reduce<(PortfolioItem & { cumulativeTarget: number })[]>(
          (last, item) => [
            ...last,
            {
              ...item,
              cumulativeTarget:
                (lastInArray(last)?.cumulativeTarget ?? 0) + item.allocationTarget / 100,
            },
          ],
          [],
        )
        .map(({ id, item, value, cumulativeTarget, allocationTarget }) => (
          <Fragment key={id}>
            <Actual
              fraction={(value + cashFractionActual) / totalValue}
              color={colorKey(abbreviateFundName(item))}
            >
              <span title={item}>{abbreviateFundName(item)}</span>
              <Adjustment
                totalValue={totalValue}
                value={(allocationTarget / 100) * (totalValue - cashTarget) - value}
                setPreview={setPreview}
                title={abbreviateFundName(item)}
              />
            </Actual>

            <Target
              containerWidth={containerWidth}
              funds={funds}
              sortedPortfolio={sortedPortfolio}
              onSetFundTargets={onSetFundTargets}
              onSetCashTarget={onSetCashTarget}
              stockValue={stockValue}
              totalValue={totalValue}
              setPreview={setPreview}
              id={id}
              fraction={(cumulativeTarget * stockValue + cashTarget) / (stockValue + cashTarget)}
              color={colorKey(abbreviateFundName(item))}
              cashTarget={cashTarget}
              allocationTarget={allocationTarget}
              touchX={touchNearestId === id ? touchX : null}
              setTouchX={setTouchX}
            />
          </Fragment>
        ))}

      {preview && <Styled.Preview>{preview}</Styled.Preview>}
    </Styled.Container>
  );
};
