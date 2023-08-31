import styled from '@emotion/styled';
import { rem } from 'polished';
import { useCallback, useMemo, useState } from 'react';
import { Chart, ReactGoogleChartProps } from 'react-google-charts';

import { ModalWindow } from '~client/components/modal-window';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';
import { useReadSankeyQuery } from '~client/types/gql';

const Container = styled.div`
  background: ${colors.white};
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: ${rem(18)} auto;
  width: 100%;

  ${breakpoint(breakpoints.mobile)} {
    width: ${rem(720)};
  }
`;

const Controls = styled.div`
  background: ${colors.white};
  display: flex;
  grid-column: 1;
  grid-row: 1;
`;

const SankeyBox = styled.div`
  grid-column: 1;
  grid-row: 2;
  overflow: auto;
`;

export type Props = {
  onClosed: () => void;
};

export const Sankey: React.FC<Props> = ({ onClosed }) => {
  const [{ data }] = useReadSankeyQuery({ requestPolicy: 'cache-and-network' });
  const [ordered, setOrdered] = useState(true);
  const toggleOrdered = useCallback(() => setOrdered((prev) => !prev), []);
  const options = useMemo<ReactGoogleChartProps['options']>(
    () =>
      ordered
        ? {
            sankey: {
              iterations: 0,
            },
          }
        : undefined,
    [ordered],
  );

  return (
    <ModalWindow title="Sankey diagram" onClosed={onClosed}>
      <Container>
        <Controls>
          <input type="checkbox" checked={ordered} onChange={toggleOrdered} /> Ordered
        </Controls>
        <SankeyBox>
          {data?.sankey ? (
            <Chart
              height={600}
              width={960}
              chartType="Sankey"
              loader={<span>Loading chart</span>}
              options={options}
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
      </Container>
    </ModalWindow>
  );
};
