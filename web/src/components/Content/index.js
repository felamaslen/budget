import React from 'react';
import { withRouter } from 'react-router-dom';
import Route, { CacheSwitch as Switch } from 'react-router-cache-route';
import PropTypes from 'prop-types';
import PageOverview from '~client/containers/PageOverview';
import PageAnalysis from '~client/containers/PageAnalysis';
import PageFunds from '~client/containers/PageFunds';
import {
    PageIncome,
    PageBills,
    PageFood,
    PageGeneral,
    PageHoliday,
    PageSocial,
} from '~client/containers/PageList';
import { PageWrapper } from '~client/styled/shared/page';

const routes = [
    { key: 'analysis', component: PageAnalysis },
    { key: 'funds', component: PageFunds },
    { key: 'income', component: PageIncome },
    { key: 'bills', component: PageBills },
    { key: 'food', component: PageFood },
    { key: 'general', component: PageGeneral },
    { key: 'holiday', component: PageHoliday },
    { key: 'social', component: PageSocial },
    { key: 'overview', path: '/', component: PageOverview },
];

const NotFound = () => (
    <div className="page page-not-found">
        <h1>{'Page not found'}</h1>
    </div>
);

const Content = () => (
    <PageWrapper className="page-wrapper">
        <Switch>
            {routes.map(({ key, path = `/${key}`, ...rest }) => (
                <Route key={key} path={path} {...rest} />
            ))}
            <Route path="/" component={NotFound} />
        </Switch>
    </PageWrapper>
);

Content.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default withRouter(Content);
