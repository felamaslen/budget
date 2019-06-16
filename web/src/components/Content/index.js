import './style.scss';
import React from 'react';
import { withRouter } from 'react-router';
import Route, { CacheSwitch as Switch } from 'react-router-cache-route';
import PropTypes from 'prop-types';
import ModalDialog from '~client/containers/ModalDialog';
import PageOverview from '~client/containers/PageOverview';
import PageAnalysis from '~client/containers/PageAnalysis';
import PageFunds from '~client/containers/PageFunds';
import {
    PageIncome,
    PageBills,
    PageFood,
    PageGeneral,
    PageHoliday,
    PageSocial
} from '~client/containers/PageList';

const routes = [
    { key: 'analysis', component: PageAnalysis },
    { key: 'funds', component: PageFunds },
    { key: 'income', component: PageIncome },
    { key: 'bills', component: PageBills },
    { key: 'food', component: PageFood },
    { key: 'general', component: PageGeneral },
    { key: 'holiday', component: PageHoliday },
    { key: 'social', component: PageSocial },
    { key: 'overview', path: '/', component: PageOverview }
];

function NotFound() {
    return (
        <div className="page page-not-found">
            <h1>{'Page not found'}</h1>
        </div>
    );
}

function Content({ loggedIn }) {
    if (!loggedIn) {
        return null;
    }

    return (
        <div className="page-wrapper">
            <Switch>
                {routes.map(({ key, path = `/${key}`, ...rest }) => (
                    <Route key={key} className="inner" path={path} {...rest} />
                ))}
                <Route path="/" component={NotFound} />
            </Switch>
            <ModalDialog />
        </div>
    );
}

Content.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

export default withRouter(Content);

