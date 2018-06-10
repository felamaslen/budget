import './style.scss';
import { List as list } from 'immutable';
import { connect } from 'react-redux';
import { aContentRequested } from '../../actions/content.actions';
import { getOverviewTable } from '../../selectors/overview';
import React from 'react';
import PropTypes from 'prop-types';
import Page from '../Page';
import OverviewTable from '../../components/OverviewTable';
import GraphOverview from '../GraphOverview';

function PageOverview({ rows, editRow, editCol, ...props }) {
    return (
        <Page page="overview" {...props}>
            <OverviewTable rows={rows} editRow={editRow} editCol={editCol} />
            <GraphOverview />
        </Page>
    );
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

