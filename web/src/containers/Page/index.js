import './style.scss';
import { connect } from 'react-redux';
import { getLoadedStatus } from '~client/selectors/app';
import { aContentRequested } from '~client/actions/content.actions';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Page({ page, loaded, children, onLoad }) {
    const [prevPage, setPrevPage] = useState(null);

    useEffect(() => {
        if (!loaded && page !== prevPage) {
            onLoad(page);
        }

        setPrevPage(page);

    }, [page, loaded, onLoad, prevPage]);

    if (!loaded) {
        return null;
    }

    const className = classNames('page', `page-${page}`);

    return (
        <div className={className}>
            {children}
        </div>
    );
}

Page.propTypes = {
    page: PropTypes.string.isRequired,
    loaded: PropTypes.bool.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]).isRequired,
    onLoad: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
    loaded: getLoadedStatus(state, props)
});

const mapDispatchToProps = dispatch => ({
    onLoad: page => dispatch(aContentRequested({ page }))
});

export default connect(mapStateToProps, mapDispatchToProps)(Page);

