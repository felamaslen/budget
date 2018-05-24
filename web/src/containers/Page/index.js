import './style.scss';
import { connect } from 'react-redux';
import { aContentRequested } from '../../actions/content.actions';
import React from 'react';
import ImmutableComponent from '../../ImmutableComponent';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class Page extends ImmutableComponent {
    componentDidMount() {
        this.props.onLoad(this.props.page);
    }
    componentDidUpdate(prevProps) {
        if (!this.props.loaded && this.props.page !== prevProps.page) {
            this.props.onLoad(this.props.page);
        }
    }
    render() {
        const { loaded, page, children } = this.props;
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

const mapStateToProps = (state, { page }) => ({
    loaded: Boolean(state.getIn(['pagesLoaded', page]))
});

const mapDispatchToProps = dispatch => ({
    onLoad: page => dispatch(aContentRequested({ page }))
});

export default connect(mapStateToProps, mapDispatchToProps)(Page);

