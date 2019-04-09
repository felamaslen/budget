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

function Content({ loggedIn }) {
    if (!loggedIn) {
        return null;
    }

    return (
        <div className="page-wrapper">
            <div className="inner">
                <Switch>
                    <Route exact path="/" component={PageOverview} />
                    <Route path="/analysis" component={PageAnalysis} />
                    <Route path="/funds" component={PageFunds} />
                    <Route path="/income" component={PageIncome} />
                    <Route path="/bills" component={PageBills} />
                    <Route path="/food" component={PageFood} />
                    <Route path="/general" component={PageGeneral} />
                    <Route path="/holiday" component={PageHoliday} />
                    <Route path="/social" component={PageSocial} />
                </Switch>
            </div>
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

