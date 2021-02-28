/* @jsx jsx */
import { jsx } from '@emotion/react';
import loadable, { LoadableComponent } from '@loadable/component';
import { Fragment } from 'react';
import { hot } from 'react-hot-loader/root';
import { RouteComponentProps, Route, Switch, withRouter } from 'react-router-dom';

import { SpinnerInit } from '~client/components/spinner';
import { useInitialData, useSubscriptions } from '~client/hooks';

type RouteObject = {
  key: string;
  component: LoadableComponent<Record<string, unknown>>;
  path?: string | string[];
  exact?: boolean;
};

const lazyOptions = { fallback: <SpinnerInit /> };

const PageOverview = loadable(
  () => import(/* webpackPrefetch: true */ '~client/components/page-overview'),
  lazyOptions,
);
const PageAnalysis = loadable(() => import('~client/components/page-analysis'), lazyOptions);
const PageFunds = loadable(() => import('~client/components/page-funds'), lazyOptions);
const PageIncome = loadable(() => import('~client/components/page-list/income'), lazyOptions);
const PageBills = loadable(() => import('~client/components/page-list/bills'), lazyOptions);
const PageFood = loadable(() => import('~client/components/page-list/food'), lazyOptions);
const PageGeneral = loadable(() => import('~client/components/page-list/general'), lazyOptions);
const PageHoliday = loadable(() => import('~client/components/page-list/holiday'), lazyOptions);
const PageSocial = loadable(() => import('~client/components/page-list/social'), lazyOptions);

const routes: RouteObject[] = [
  { key: 'analysis', component: hot(PageAnalysis) },
  { key: 'funds', component: hot(PageFunds) },
  { key: 'income', component: hot(PageIncome) },
  { key: 'bills', component: hot(PageBills) },
  { key: 'food', component: hot(PageFood) },
  { key: 'general', component: hot(PageGeneral) },
  { key: 'holiday', component: hot(PageHoliday) },
  { key: 'social', component: hot(PageSocial) },
  {
    key: 'overview',
    path: ['/', '/net-worth', '/net-worth/*'],
    exact: true,
    component: hot(PageOverview),
  },
];

const NotFound: React.FC = () => (
  <div>
    <h1>{'Page not found'}</h1>
  </div>
);

const ContentWithData: React.FC = () => {
  useSubscriptions();

  return (
    <Fragment>
      <Switch>
        {routes.map(({ key, ...options }) => (
          <Route key={key} path={options.path ?? `/${key}`} {...options} />
        ))}
        <Route path="/" component={NotFound} />
      </Switch>
    </Fragment>
  );
};

const Content: React.FC<RouteComponentProps> = () => {
  const { loading, error } = useInitialData();

  if (loading) {
    return <SpinnerInit />;
  }
  if (error) {
    return null;
  }

  return <ContentWithData />;
};

export const LoggedIn = withRouter(Content);
export default LoggedIn;
