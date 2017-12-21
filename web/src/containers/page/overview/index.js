/**
 * Overview page component
 */

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
        const { loaded } = this.props;

        if (!loaded) {
            return null;
        }

        return <div className="page-overview">
            <OverviewTable />
            <OverviewGraphs />
        </div>;
    }
}

PageOverview.propTypes = {
    loaded: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    page: 'overview',
    loaded: Boolean(state.getIn(['pagesLoaded', 'overview']))
});

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(aContentRequested({ page: 'overview' }))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageOverview);

