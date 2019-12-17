import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Table } from '~/types/overview';
import { getOverviewTable } from '~/selectors/overview';
import { Page } from '~/styled/page';
import OverviewTable from '~/components/overview-table';

const Overview: FunctionComponent = () => {
  const table: Table = useSelector(getOverviewTable);

  return (
    <Page>
      <OverviewTable table={table} />
    </Page>
  );
};

export default Overview;
