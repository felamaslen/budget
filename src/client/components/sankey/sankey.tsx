import styled from '@emotion/styled';
import { rem } from 'polished';
import React from 'react';
import { Chart } from 'react-google-charts';

import { ModalWindow } from '~client/components/modal-window';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';
import { useReadSankeyQuery } from '~client/types/gql';

const SankeyBox = styled.div`
  background: ${colors.white};
  overflow: auto;
  width: 100%;

  ${breakpoint(breakpoints.mobile)} {
    width: ${rem(720)};
  }
`;

export type Props = {
  onClosed: () => void;
};

export const Sankey: React.FC<Props> = ({ onClosed }) => {
  const [{ data }] = useReadSankeyQuery({ requestPolicy: 'cache-and-network' });

  return (
    <ModalWindow title="Sankey diagram" onClosed={onClosed}>
      <SankeyBox>
        {data?.sankey ? (
          <Chart
            height={600}
            width={960}
            chartType="Sankey"
            loader={<span>Loading chart</span>}
            data={[
              ['From', 'To', 'Weight'],
              ...data.sankey.links.map<[string, string, number]>(({ from, to, weight }) => [
                from,
                to,
                weight,
              ]),
            ]}
          />
        ) : (
          <span>Data not loaded</span>
        )}
      </SankeyBox>
    </ModalWindow>
  );
};
