import { css } from '@emotion/react';
import loadable from '@loadable/component';
import { rem } from 'polished';
import { useState, useCallback, Fragment } from 'react';
import { hot } from 'react-hot-loader/root';
import { Route, RouteComponentProps } from 'react-router-dom';
import PuffLoader from 'react-spinners/PuffLoader';

import * as Styled from './styles';
import { AddReceipt } from '~client/components/add-receipt';
import { GraphOverview } from '~client/components/graph-overview';
import { ModalWindow } from '~client/components/modal-window/styles';
import { OverviewTable } from '~client/components/overview-table';
import { breakpoint } from '~client/styled/mixins';
import { FlexCenter } from '~client/styled/shared';
import { breakpoints, colors } from '~client/styled/variables';

const LoadingFallback: React.FC = () => (
  <ModalWindow visible={true}>
    <FlexCenter
      css={css`
        background: ${colors.translucent.dark.light};
        flex: 1;
        justify-content: center;
        width: 100%;

        ${breakpoint(breakpoints.mobile)} {
          flex: 0 0 ${rem(480)};
        }
      `}
    >
      <PuffLoader />
    </FlexCenter>
  </ModalWindow>
);

const lazyOptions = { fallback: <LoadingFallback /> };

const NetWorth = hot(loadable(() => import('~client/components/net-worth'), lazyOptions));

export const PageOverview: React.FC<RouteComponentProps> = () => {
  const [addingReceipt, setAddingReceipt] = useState<boolean>(false);
  const addReceipt = useCallback(() => setAddingReceipt(true), []);

  return (
    <Fragment>
      {!addingReceipt && (
        <Fragment>
          <Route path="/net-worth" component={NetWorth} />
        </Fragment>
      )}
      {addingReceipt && <AddReceipt setAddingReceipt={setAddingReceipt} />}
      <Styled.Page>
        <OverviewTable addReceipt={addReceipt} />
        <GraphOverview />
      </Styled.Page>
    </Fragment>
  );
};
export default PageOverview;
