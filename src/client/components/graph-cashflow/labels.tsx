/* @jsx jsx */
import { css, jsx } from '@emotion/react';
import styled from '@emotion/styled';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import { rem, rgba } from 'polished';

import { HoverEffect, LabelProps } from '~client/components/graph/hooks';
import { useSelfAdjustingLabel } from '~client/components/highlight-point';
import { LabelBase, LabelBaseProps } from '~client/components/highlight-point/styles';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { Flex, FlexColumn } from '~client/styled/shared';

const CashflowLabel = styled(LabelBase)<LabelBaseProps>(
  ({ color }) => css`
    background-color: ${rgba(color, 0.85)};
    border-radius: ${rem(2)};
    display: flex;
    flex-flow: column;
    overflow: hidden;
    padding: ${rem(1)} ${rem(4)};
    white-space: nowrap;
  `,
);

const FromLabel = styled(Flex)`
  span {
    font-size: ${rem(10)};
  }
`;

const DateValue = styled.span`
  align-items: center;
  display: flex;
`;

const DateLabel = styled.span`
  font-size: ${rem(11)};
  margin-right: ${rem(4)};
`;

const NameLabel = styled.span`
  font-size: ${rem(9)};
  text-align: center;
`;

const ValueLabel = styled.span`
  flex: 1 1 auto;
  font-size: ${rem(13)};
  font-weight: bold;
  text-align: center;
`;

export const Label: React.FC<LabelProps> = ({ name, main, compare, ...props }) => {
  const [ref, style] = useSelfAdjustingLabel(props);
  const mainPoint = compare ?? main;
  const fromPoint = compare ? main : undefined;
  return (
    <CashflowLabel {...props} ref={ref} style={style}>
      <FlexColumn>
        {fromPoint && (
          <FromLabel>
            <DateLabel>{format(fromUnixTime(fromPoint.point[0]), 'MMM yyyy')}</DateLabel>
            <ValueLabel>
              {props.secondary
                ? formatPercent(fromPoint.unstackedPoint[1], { precision: 1 })
                : formatCurrency(fromPoint.unstackedPoint[1], { precision: 2 })}
            </ValueLabel>
          </FromLabel>
        )}
        <DateValue>
          <DateLabel>
            {compare ? '↪' : ''}
            {format(fromUnixTime(mainPoint.point[0]), 'MMM yyyy')}
          </DateLabel>
          <ValueLabel>
            {props.secondary
              ? formatPercent(mainPoint.unstackedPoint[1], { precision: 1 })
              : formatCurrency(mainPoint.unstackedPoint[1], { precision: 2 })}
          </ValueLabel>
        </DateValue>
        <NameLabel>{name}</NameLabel>
      </FlexColumn>
    </CashflowLabel>
  );
};

export const hoverEffect: HoverEffect = { Label };
