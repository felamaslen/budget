import React, { useState, useCallback } from 'react';
import { Route } from 'react-router-dom';

import * as Styled from './styles';
import { AddReceipt } from '~client/components/add-receipt';
import { GraphOverview } from '~client/components/graph-overview';
import { NetWorth } from '~client/components/net-worth';
import { OverviewTable } from '~client/components/overview-table';

export const PageOverview: React.FC = () => {
  const [addingReceipt, setAddingReceipt] = useState<boolean>(false);
  const addReceipt = useCallback(() => setAddingReceipt(true), []);

  return (
    <>
      {!addingReceipt && <Route path="/net-worth" component={NetWorth} />}
      {addingReceipt && <AddReceipt setAddingReceipt={setAddingReceipt} />}
      <Styled.Page>
        <OverviewTable addReceipt={addReceipt} />
        <GraphOverview />
      </Styled.Page>
    </>
  );
};
