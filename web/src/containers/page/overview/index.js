/**
 * Overview page component
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';
import { aContentRequested } from '../../../actions/content.actions';
import React from 'react';
import PureComponent from '../../../immutable-component';
import PropTypes from 'prop-types';
import OverviewTable from './table';
import OverviewGraphs from './graph';

export class PageOverview extends PureComponent {
    componentWillMount() {
        this.props.onLoad();
    }
    render() {
        const { loaded, rows, editRow, editCol } = this.props;

        if (!loaded) {
            return null;
        }

        return <div className="page-overview">
            <OverviewTable rows={rows} editRow={editRow} editCol={editCol} />
            <OverviewGraphs />
        </div>;
    }
}

PageOverview.propTypes = {
    loaded: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
    rows: PropTypes.instanceOf(list),
    editRow: PropTypes.number,
    editCol: PropTypes.number
};

const mapStateToProps = state => ({
    page: 'overview',
    loaded: Boolean(state.getIn(['pagesLoaded', 'overview'])),
    rows: state.getIn(['pages', 'overview', 'rows']),
    editRow: state.getIn(['edit', 'row']),
    editCol: state.getIn(['edit', 'col'])
});

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(aContentRequested({ page: 'overview' }))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageOverview);

