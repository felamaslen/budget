import './style.scss';
import { List as list } from 'immutable';
import { connect } from 'react-redux';
import { aContentRequested } from '~client/actions/content.actions';
import { getOverviewTable } from '~client/selectors/overview';
import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import Page from '~client/containers/Page';
import OverviewTable from '~client/components/OverviewTable';
import GraphOverview from '~client/containers/GraphOverview';
import NetWorth from '~client/containers/NetWorth';

function PageOverview({ rows, editRow, editCol, ...props }) {
    return <>
        <Page page="overview" {...props}>
            <OverviewTable rows={rows} editRow={editRow} editCol={editCol} />
            <GraphOverview />
        </Page>
        <Route path="/net-worth" component={NetWorth} />
    </>;
}

PageOverview.propTypes = {
    rows: PropTypes.instanceOf(list),
    editRow: PropTypes.number,
    editCol: PropTypes.number
};

const mapStateToProps = state => ({
    rows: getOverviewTable(state),
    editRow: state.getIn(['edit', 'row']),
    editCol: state.getIn(['edit', 'col'])
});

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(aContentRequested({ page: 'overview' }))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageOverview);
