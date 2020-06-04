import React from 'react';
import Route, { CacheSwitch as Switch } from 'react-router-cache-route';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { PageAnalysis } from '~client/components/page-analysis';
import * as PageList from '~client/components/page-list';
import { PageOverview } from '~client/components/page-overview';
import { PageWrapper } from '~client/styled/shared';

const routes = [
  { key: 'analysis', component: PageAnalysis },
  { key: 'funds', component: PageList.Funds },
  { key: 'income', component: PageList.Income },
  { key: 'bills', component: PageList.Bills },
  { key: 'food', component: PageList.Food },
  { key: 'general', component: PageList.General },
  { key: 'holiday', component: PageList.Holiday },
  { key: 'social', component: PageList.Social },
  {
    key: 'overview',
    path: ['/', '/net-worth', '/net-worth/*'],
    exact: true,
    component: PageOverview,
  },
];

const NotFound: React.FC = () => (
  <div>
    <h1>{'Page not found'}</h1>
  </div>
);

const Content: React.FC<RouteComponentProps> = () => (
  <PageWrapper>
    <Switch>
      {routes.map(({ key, path = `/${key}`, ...rest }) => (
        <Route key={key} path={path} {...rest} />
      ))}
      <Route path="/" component={NotFound} />
    </Switch>
  </PageWrapper>
);

export default withRouter(Content);
