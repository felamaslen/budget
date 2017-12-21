/**
 * List page component
 */

import { connect } from 'react-redux';
import { aContentRequested } from '../../../actions/content.actions';
import React from 'react';
import PureComponent from '../../../immutable-component';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Body from './body';
import AfterList from './after-list';

class PageList extends PureComponent {
    componentDidMount() {
        this.props.onLoad();
    }
    render() {
        const { loaded, page } = this.props;

        if (!loaded) {
            return null;
        }

        const listClassName = classNames('list-insert', `list-${page}`, 'list');

        const pageClassName = classNames(`page-${page}`);

        return <div className={pageClassName}>
            <div className={listClassName}>
                <Body page={page} />
            </div>
            <AfterList page={page} />
        </div>;
    }
}

PageList.propTypes = {
    loaded: PropTypes.bool.isRequired,
    page: PropTypes.string.isRequired,
    onLoad: PropTypes.func.isRequired
};

const mapStateToProps = (state, { page }) => ({
    loaded: Boolean(state.getIn(['pagesLoaded', page]))
});

const mapDispatchToProps = (dispatch, { page }) => ({
    onLoad: () => dispatch(aContentRequested({ page }))
});

export default connect(mapStateToProps, mapDispatchToProps)(PageList);

