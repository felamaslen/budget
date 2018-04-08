import React from 'react';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import ModalDialog from '../../containers/ModalDialog';
import PageOverview from '../../containers/PageOverview';
import PageAnalysis from '../../containers/PageAnalysis';
import PageFunds from '../../containers/PageFunds';
import PageList from '../../containers/PageList';

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
                    <Route path="/income" render={() => <PageList page="income" />} />
                    <Route path="/bills" render={() => <PageList page="bills" />} />
                    <Route path="/food" render={() => <PageList page="food" />} />
                    <Route path="/general" render={() => <PageList page="general" />} />
                    <Route path="/holiday" render={() => <PageList page="holiday" />} />
                    <Route path="/social" render={() => <PageList page="social" />} />
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

