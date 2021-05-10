import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem, rgba } from 'polished';

import { FormField } from '~client/components/form-field/styles';
import { Flex, FlexCenter, FlexColumn } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export const Main = styled(FlexColumn)`
  align-items: center;
  background: ${colors.white};
`;

export const StatusBar = styled(Flex)`
  align-items: center;
  background: ${colors.light.mediumDark};
  flex: 0 0 ${rem(18)};
  padding: ${rem(2)} ${rem(8)};
  width: 100%;
`;

export const TitleBar = styled(FlexCenter)`
  flex: 0 0 ${rem(20)};
  margin: ${rem(2)} 0;
  width: 100%;
`;

export const OverallHealth = styled(FlexColumn)`
  flex: 0 0 ${rem(46)};
  width: 100%;
`;

export const HealthTargetWrapper = styled(Flex)`
  flex: 0 0 ${rem(24)};
  height: ${rem(24)};
  position: relative;
  width: 100%;
`;

export const HealthTargetWrapperInside = styled(HealthTargetWrapper)`
  position: absolute;
`;

export const HealthTarget = styled.div<{ color: string }>(
  ({ color }) => css`
    border: 2px solid ${color};
    height: 100%;
  `,
);
export const HealthActual = styled.div<{ color: string }>(
  ({ color }) => css`
    background: ${rgba(color, 0.5)};
    height: 100%;
  `,
);

export const HealthAxis = styled(Flex)`
  align-items: flex-end;
  flex: 0 0 ${rem(16)};
  font-size: ${rem(10)};
  width: 100%;

  & > span {
    text-align: center;
    transform: translateX(-50%);
  }
`;

export const HealthStatus = styled(FlexCenter)`
  font-size: ${rem(14)};
`;

export const DateTitle = styled.h3`
  flex: 1;
  font-size: ${rem(16)};
  margin: 0;
  text-align: center;
`;

export const ErrorStatus = styled.span`
  color: ${colors.error};
  margin-left: ${rem(8)};
`;

export const BucketMeta = styled(FlexColumn)`
  justify-content: center;
  display: flex;
  flex: 0 0 ${rem(28)};
  font-size: ${rem(12)};

  ${FormField}, input[type="number"], input[type="text"], button {
    font-size: inherit;
    margin: 0;
    white-space: nowrap;
    width: ${rem(72)};
  }
`;

export const Filler = styled.div`
  flex: 1;
  width: 100%;
`;

export const BucketForm = styled.li`
  border: 1px dashed ${colors.light.dark};
  border-radius: ${rem(8)};
  display: flex;
  flex: 0 0 ${rem(100)};
  flex-flow: column;
  height: ${rem(128)};
  margin: ${rem(2)};
  padding: ${rem(2)} ${rem(4)};
  width: ${rem(100)};
`;

export const BucketFormNew = styled(BucketForm)`
  border-color: ${colors.light.mediumLight};
`;

export const BucketFormHealth = styled(Flex)`
  align-items: center;
  flex: 0 0 ${rem(18)};
  font-size: ${rem(11)};

  ${FormField}, input[type="text"] {
    width: ${rem(64)};
  }
`;

export const BucketFormTitle = styled.h4`
  flex: 1;
  font-style: italic;
  margin: 0;
`;

export const BucketValuesIndicator = styled.div`
  flex: 1;
  position: relative;
`;

const BucketValuesIndicatorPart = styled.div`
  bottom: 0;
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
`;

export const BucketExpected = styled(BucketValuesIndicatorPart)`
  border: 2px solid ${colors.black};
`;

export const BucketActual = styled(BucketValuesIndicatorPart)`
  background: ${colors.black};
`;

export const BucketGroup = styled(FlexColumn)<{ color: string }>(
  ({ color }) => css`
    flex: 1;
    margin: ${rem(2)} 0 ${rem(4)} 0;

    ${BucketExpected} {
      border-color: ${color};
    }
    ${BucketActual} {
      background-color: ${rgba(color, 0.4)};
    }
  `,
);

export const BucketGroupList = styled(Flex)`
  flex: 1;
  overflow-y: auto;
  max-height: ${rem(400)};
  width: 100%;
`;

export const BucketGroupTitle = styled.h4`
  font-size: ${rem(14)};
  margin: ${rem(2)} 0;
  text-align: center;
  text-transform: capitalize;
`;

export const BucketGroupFormList = styled.ul`
  display: flex;
  flex: 0 0 ${rem(128)};
  flex-flow: column;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
`;
