/* @jsx jsx */
import { jsx } from '@emotion/react';
import loadable, { LoadableComponent } from '@loadable/component';
import { Fragment, useEffect, useRef } from 'react';
import { hot } from 'react-hot-loader/root';
import { RouteComponentProps, Route, Switch, withRouter } from 'react-router-dom';

import { SpinnerInit } from '~client/components/spinner';
import { useInitialData, useSubscriptions } from '~client/hooks';
import { H1 } from '~client/styled/shared';

type RouteObject = {
  key: string;
  component: LoadableComponent<RouteComponentProps>;
  path?: string | string[];
  exact?: boolean;
};

const lazyOptions = { fallback: <SpinnerInit /> };

const PageOverview = loadable(
  () => import(/* webpackPrefetch: true */ '~client/components/page-overview'),
  lazyOptions,
);
const PagePlanning = loadable(() => import('~client/components/planning'), lazyOptions);
const PageAnalysis = loadable(() => import('~client/components/page-analysis'), lazyOptions);
const PageFunds = loadable(() => import('~client/components/page-funds'), lazyOptions);
const PageIncome = loadable(() => import('~client/components/page-list/income'), lazyOptions);
const PageBills = loadable(() => import('~client/components/page-list/bills'), lazyOptions);
const PageFood = loadable(() => import('~client/components/page-list/food'), lazyOptions);
const PageGeneral = loadable(() => import('~client/components/page-list/general'), lazyOptions);
const PageHoliday = loadable(() => import('~client/components/page-list/holiday'), lazyOptions);
const PageSocial = loadable(() => import('~client/components/page-list/social'), lazyOptions);

const routes: RouteObject[] = [
  { key: 'planning', path: '/planning/:year?', component: hot(PagePlanning) },
  {
    key: 'analysis',
    path: '/analysis/:groupBy?/:period?/:page?',
    component: hot(PageAnalysis),
  },
  { key: 'funds', component: hot(PageFunds) },
  { key: 'income', component: hot(PageIncome) },
  { key: 'bills', component: hot(PageBills) },
  { key: 'food', component: hot(PageFood) },
  { key: 'general', component: hot(PageGeneral) },
  { key: 'holiday', component: hot(PageHoliday) },
  { key: 'social', component: hot(PageSocial) },
  {
    key: 'overview',
    path: ['/', '/net-worth', '/net-worth/*', '/planning', '/planning/*'],
    exact: true,
    component: hot(PageOverview),
  },
];

const NotFound: React.FC = () => (
  <div>
    <H1>{'Page not found'}</H1>
  </div>
);

export type ContentProps = { connectionAttempt: number };

const ContentWithData: React.FC<ContentProps> = ({ connectionAttempt }) => {
  const onReconnect = useSubscriptions();
  const lastConnectionAttempt = useRef<number>(0);
  useEffect(() => {
    if (connectionAttempt > lastConnectionAttempt.current) {
      onReconnect();
      lastConnectionAttempt.current = connectionAttempt;
    }
  }, [connectionAttempt, onReconnect]);

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

const Content: React.FC<RouteComponentProps & ContentProps> = ({ connectionAttempt }) => {
  const { loading, error } = useInitialData();

  if (loading) {
    return <SpinnerInit />;
  }
  if (error) {
    return null;
  }

  return <ContentWithData connectionAttempt={connectionAttempt} />;
};

export const LoggedIn = withRouter(Content);
export default LoggedIn;
