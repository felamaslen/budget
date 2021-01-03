/* @jsx jsx */
import { jsx } from '@emotion/react';
import { FC, lazy, LazyExoticComponent, ReactNode, Suspense } from 'react';
import { hot } from 'react-hot-loader/root';
import { RouteComponentProps, Route, Switch, withRouter } from 'react-router-dom';

import { Spinner } from '~client/components/spinner';
import { useInitialData, useSubscriptions } from '~client/hooks';
import { PageWrapper } from '~client/styled/shared';

type RouteObject = {
  key: string;
  Component: LazyExoticComponent<FC>;
  path?: string | string[];
  exact?: boolean;
};

const PageOverview = lazy(
  () => import(/* webpackChunkName: "overview" */ '~client/components/page-overview'),
);
const PageAnalysis = lazy(
  () => import(/* webpackChunkName: "analysis" */ '~client/components/page-analysis'),
);
const PageFunds = lazy(
  () => import(/* webpackChunkName: "funds" */ '~client/components/page-funds'),
);
const PageIncome = lazy(
  () => import(/* webpackChunkName: "income" */ '~client/components/page-list/income'),
);
const PageBills = lazy(
  () => import(/* webpackChunkName: "bills" */ '~client/components/page-list/bills'),
);
const PageFood = lazy(
  () => import(/* webpackChunkName: "food" */ '~client/components/page-list/food'),
);
const PageGeneral = lazy(
  () => import(/* webpackChunkName: "general" */ '~client/components/page-list/general'),
);
const PageHoliday = lazy(
  () => import(/* webpackChunkName: "holiday" */ '~client/components/page-list/holiday'),
);
const PageSocial = lazy(
  () => import(/* webpackChunkName: "social" */ '~client/components/page-list/social'),
);

const routes: RouteObject[] = [
  { key: 'analysis', Component: hot(PageAnalysis) },
  { key: 'funds', Component: hot(PageFunds) },
  { key: 'income', Component: hot(PageIncome) },
  { key: 'bills', Component: hot(PageBills) },
  { key: 'food', Component: hot(PageFood) },
  { key: 'general', Component: hot(PageGeneral) },
  { key: 'holiday', Component: hot(PageHoliday) },
  { key: 'social', Component: hot(PageSocial) },
  {
    key: 'overview',
    path: ['/', '/net-worth', '/net-worth/*'],
    exact: true,
    Component: hot(PageOverview),
  },
];

const NotFound: React.FC = () => (
  <div>
    <h1>{'Page not found'}</h1>
  </div>
);

const Content: React.FC<RouteComponentProps> = () => {
  const loading = useInitialData();
  useSubscriptions();

  if (loading) {
    return <Spinner />;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <PageWrapper>
        <Switch>
          {routes.map(({ key, Component, ...options }) => (
            <Route
              key={key}
              path={options.path ?? `/${key}`}
              {...options}
              render={(): ReactNode => <Component />}
            />
          ))}
          <Route path="/" component={NotFound} />
        </Switch>
      </PageWrapper>
    </Suspense>
  );
};

export const LoggedIn = withRouter(Content);
export default LoggedIn;
