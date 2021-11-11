import { useMemo } from 'react';
import { Chart } from 'react-google-charts';
import type { ReactGoogleChartProps } from 'react-google-charts/dist/types';

import { useOverviewData } from '../hooks/overview';
import * as Styled from './styles';
import { colors } from '~client/styled/variables';

type StandardSlice =
  | 'Taxes'
  | 'NI'
  | 'Student loan'
  | 'Investments'
  | 'SAYE'
  | 'Pension contributions'
  | 'CC spending'
  | 'Bills';

const rowColors: Record<StandardSlice, string> = {
  Taxes: '#85200c',
  NI: '#a61c00',
  'Student loan': '#cc4125',
  Investments: '#6aa84f',
  SAYE: '#38761d',
  'Pension contributions': '#274e13',
  'CC spending': '#3c78d8',
  Bills: '#1155cc',
};

type SliceDef = {
  name: StandardSlice;
  match?: RegExp;
};

const sliceDefs: SliceDef[] = [
  { name: 'Taxes' },
  { name: 'NI' },
  { name: 'Student loan' },
  { name: 'Investments' },
  { name: 'SAYE' },
  { name: 'Pension contributions' },
  { name: 'Bills', match: /(mortgage|bills)/i },
  { name: 'CC spending' },
];

export const PlanningPieChart: React.FC = () => {
  const rows = useOverviewData();
  const data = useMemo<[StandardSlice | 'name', string | number][]>(
    () =>
      sliceDefs.reduce<[StandardSlice | 'name', number | string][]>(
        (last, { name, match }): [StandardSlice | 'name', number | string][] => {
          const matchingRow = rows.find(
            (compare) => match?.test(compare.name) || compare.name === name,
          );
          return matchingRow ? [...last, [name, matchingRow.value / 100]] : last;
        },
        [['name', 'value']],
      ),
    [rows],
  );

  const pieOptions = useMemo<ReactGoogleChartProps['options']>(
    () => ({
      colors: data
        .slice(1)
        .map<string>(([name]) => rowColors[name as StandardSlice] ?? colors.green),
      height: 300,
      is3D: true,
      title: 'Expenses',
      width: 500,
    }),
    [data],
  );

  return (
    <Styled.PlanningPieChart>
      <Chart
        chartType="PieChart"
        data={data}
        options={pieOptions}
        formatters={[
          {
            type: 'NumberFormat',
            column: 1,
            options: {
              prefix: '£',
              negativeParens: true,
            },
          },
        ]}
      />
    </Styled.PlanningPieChart>
  );
};
