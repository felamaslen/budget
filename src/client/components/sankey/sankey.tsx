import styled from '@emotion/styled';
import { rem } from 'polished';
import React from 'react';
import { Chart } from 'react-google-charts';
import type { RouteComponentProps } from 'react-router';

import { ModalWindow, useCloseModal } from '~client/components/modal-window';
import { colors } from '~client/styled/variables';
import { useReadSankeyQuery } from '~client/types/gql';

const SankeyBox = styled.div`
  background: ${colors.white};
  width: ${rem(640)};
`;

export const Sankey: React.FC<RouteComponentProps> = ({ history }) => {
  const onClosed = useCloseModal(history);
  const [{ data }] = useReadSankeyQuery();

  return (
    <ModalWindow title="Sankey diagram" onClosed={onClosed}>
      <SankeyBox>
        {data?.sankey ? (
          <Chart
            height={480}
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
