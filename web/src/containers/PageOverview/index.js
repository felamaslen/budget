import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

import { getOverviewTable } from '~client/selectors/overview';
import Page from '~client/components/Page';
import OverviewTable from '~client/components/OverviewTable';
import GraphOverview from '~client/containers/GraphOverview';
import NetWorth from '~client/containers/NetWorth';
import './style.scss';

const PageOverview = ({ table, ...props }) => (
    <>
        <Page page="overview" {...props}>
            <OverviewTable rows={table} />
            <GraphOverview />
        </Page>
        <Route path="/net-worth" component={NetWorth} />
    </>
);

PageOverview.propTypes = {
    table: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        cells: PropTypes.arrayOf(PropTypes.shape({
            column: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
            value: PropTypes.oneOfType([
                PropTypes.string.isRequired,
                PropTypes.number.isRequired,
                PropTypes.instanceOf(DateTime).isRequired,
            ]).isRequired,
            rgb: PropTypes.arrayOf(PropTypes.number),
        }).isRequired),
        past: PropTypes.bool.isRequired,
        active: PropTypes.bool.isRequired,
        future: PropTypes.bool.isRequired,
    }).isRequired).isRequired,
};

const mapStateToProps = (state) => ({
    table: getOverviewTable(state),
});

export default connect(mapStateToProps)(PageOverview);
