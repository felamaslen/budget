import React, { FunctionComponent } from 'react';

import { Table } from '~/types/overview';

type OverviewTableProps = {
  table: Table;
};

const OverviewTable: FunctionComponent<OverviewTableProps> = () => <span>Overview table</span>;

export default OverviewTable;
