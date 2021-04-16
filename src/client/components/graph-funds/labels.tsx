/* @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import { rem } from 'polished';
import { useSelector } from 'react-redux';

import { HoverEffect, LabelProps } from '~client/components/graph/hooks';
import { useSelfAdjustingLabel } from '~client/components/highlight-point';
import { LabelBase } from '~client/components/highlight-point/styles';
import { formatPercent } from '~client/modules/format';
import { formatValue } from '~client/modules/funds';
import { getFundsCache } from '~client/selectors';
import { FlexCenter } from '~client/styled/shared';
import { FundMode } from '~client/types/enum';

const NoWrap = styled.span`
  white-space: nowrap;
`;

const CenterNoWrap = styled(FlexCenter)`
  white-space: nowrap;
`;

const FundsLabel = styled(LabelBase)`
  border-radius: ${rem(2)};
  display: flex;
  flex-flow: column;
  padding: ${rem(1)} ${rem(3)};
`;

const StockName = styled(NoWrap)`
  font-size: ${rem(12)};
  font-weight: bold;
  margin-right: ${rem(4)};
`;

const DateLabel = styled(NoWrap)`
  font-size: ${rem(11)};
  text-align: center;
  width: 100%;
`;

const ValueLabel = styled(NoWrap)`
  font-size: ${rem(12)};
`;

const formatTime = (startTime: number, cacheTime: number): string =>
  format(fromUnixTime(startTime + cacheTime), 'dd/MM/yy');

type LabelBaseFundsProps = LabelProps & { mode: FundMode; showChange?: boolean };

const LabelBaseFunds: React.FC<LabelBaseFundsProps> = ({
  name,
  main,
  compare,
  mode,
  showChange = false,
  ...props
}) => {
  const { startTime } = useSelector(getFundsCache);

  const [ref, style] = useSelfAdjustingLabel(props);
  const valueLabel = compare
    ? `${formatValue(main.unstackedPoint[1], mode)} → ${formatValue(
        compare.unstackedPoint[1],
        mode,
      )}`
    : formatValue(main.unstackedPoint[1], mode);

  const valueLabelChange =
    compare && showChange
      ? ` (${formatPercent(
          (compare.unstackedPoint[1] - main.unstackedPoint[1]) / main.unstackedPoint[1],
        )})`
      : '';

  const dateLabel = compare
    ? `${formatTime(startTime, main.point[0])} → ${formatTime(startTime, compare.point[0])}`
    : formatTime(startTime, main.point[0]);

  return (
    <FundsLabel {...props} ref={ref} style={style}>
      <CenterNoWrap>
        <StockName>{name}</StockName>
        <ValueLabel>
          {valueLabel}
          {valueLabelChange}
        </ValueLabel>
      </CenterNoWrap>
      <DateLabel>{dateLabel}</DateLabel>
    </FundsLabel>
  );
};

const LabelROI: React.FC<LabelProps> = (props) => <LabelBaseFunds {...props} mode={FundMode.Roi} />;

const LabelValue: React.FC<LabelProps> = (props) => (
  <LabelBaseFunds {...props} mode={FundMode.Value} />
);

const LabelPrice: React.FC<LabelProps> = (props) => (
  <LabelBaseFunds {...props} mode={FundMode.Price} showChange={true} />
);

const LabelPriceNormalised: React.FC<LabelProps> = (props) => (
  <LabelBaseFunds {...props} mode={FundMode.PriceNormalised} showChange={true} />
);

export const hoverEffectByMode: Record<FundMode, HoverEffect> = {
  [FundMode.Roi]: { Label: LabelROI },
  [FundMode.Value]: { Label: LabelValue },
  [FundMode.Stacked]: { Label: LabelValue },
  [FundMode.Price]: { Label: LabelPrice },
  [FundMode.PriceNormalised]: { Label: LabelPriceNormalised },
};
