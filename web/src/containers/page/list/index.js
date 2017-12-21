/**
 * List page component
 */

import extendableContainer from '../../container-extender';
import { aContentRequested } from '../../../actions/content.actions';
import React from 'react';
import PureComponent from '../../../immutable-component';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Media from 'react-media';
import { mediaQueries } from '../../../misc/const';

import { BodyMobileContainer as getBodyMobile } from './body/mobile';
import { BodyContainer as getBody } from './body';

export class PageList extends PureComponent {
    componentDidMount() {
        this.props.onLoad();
    }
    bodyMobile() {
        const BodyMobile = getBodyMobile(this.props.page);

        return <BodyMobile />;
    }
    renderListMobile(render) {
        if (!render) {
            return null;
        }

        return <div>{this.bodyMobile()}</div>;
    }
    bodyDesktop () {
        const Body = getBody(this.props.page);

        return <Body />;
    }
    renderListDesktop(render) {
        if (!render) {
            return null;
        }

        return <div>{this.bodyDesktop()}</div>;
    }
    renderList() {
        return <div>
            <Media query={mediaQueries.mobile}>{render => this.renderListMobile(render)}</Media>
            <Media query={mediaQueries.desktop}>{render => this.renderListDesktop(render)}</Media>
        </div>;
    }
    afterList() {
        return null;
    }
    render() {
        const { loaded, page } = this.props;

        if (!loaded) {
            return null;
        }

        const listClassName = classNames('list-insert', `list-${page}`, 'list');

        const listRendered = this.renderList();
        const afterList = this.afterList();

        const pageClassName = classNames(`page-${page}`);

        return <div className={pageClassName}>
            <div className={listClassName}>
                {listRendered}
            </div>
            {afterList}
        </div>;
    }
}

PageList.propTypes = {
    loaded: PropTypes.bool.isRequired,
    page: PropTypes.string.isRequired,
    onLoad: PropTypes.func.isRequired
};

const stateDefault = page => state => ({
    page,
    loaded: Boolean(state.getIn(['pagesLoaded', page]))
});

const dispatchDefault = page => dispatch => ({
    onLoad: () => dispatch(aContentRequested({ page }))
});

export const PageListContainer = page =>
    extendableContainer(stateDefault, dispatchDefault)(page)()(PageList);

export default extendableContainer(stateDefault, dispatchDefault);

