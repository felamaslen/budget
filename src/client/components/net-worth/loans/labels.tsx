import styled from '@emotion/styled';
import formatDate from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import { rem } from 'polished';

import { LabelProps } from '~client/components/graph';
import { useSelfAdjustingLabel } from '~client/components/highlight-point';
import { LabelBase } from '~client/components/highlight-point/styles';
import { formatCurrency } from '~client/modules/format';
import { CenterNoWrap, FlexCenterColumn } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

const Label = styled(LabelBase)`
  background: ${colors.translucent.light.light};
  border: 1px solid ${colors.light.dark};
  border-radius: ${rem(8)};
  color: ${colors.black};
  padding: ${rem(2)} ${rem(4)};
`;

const LabelBar = styled.div`
  line-height: ${rem(24)};
`;

export const LoansGraphLabel: React.FC<LabelProps> = (props) => {
  const { main, compare } = props;
  const [ref, style] = useSelfAdjustingLabel(props);
  if (!compare) {
    return (
      <Label {...props} ref={ref} style={style}>
        <CenterNoWrap>
          {formatDate(fromUnixTime(main.point[0]), 'dd/MM/yyyy')}
          &nbsp;-&nbsp;{formatCurrency(main.point[1])}
        </CenterNoWrap>
      </Label>
    );
  }
  return (
    <Label {...props} ref={ref} style={style}>
      <FlexCenterColumn>
        <LabelBar>
          {formatDate(fromUnixTime(main.point[0]), 'dd/MM/yyyy')}
          &nbsp;-&nbsp;
          {formatDate(fromUnixTime(compare.point[0]), 'dd/MM/yyyy')}
        </LabelBar>
        <LabelBar>
          {formatCurrency(main.point[1])}
          &rarr;
          {formatCurrency(compare.point[1])}
        </LabelBar>
      </FlexCenterColumn>
    </Label>
  );
};
