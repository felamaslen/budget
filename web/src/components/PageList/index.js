/**
 * List page component
 */

import extendableContainer from '../containerExtender';

import { aKeyPressed } from '../../actions/AppActions';
import { aContentRequested } from '../../actions/ContentActions';

import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries, PAGES } from '../../misc/const';

import Page from '../Page';
import { BodyMobileContainer as getBodyMobile } from './BodyMobile';

import { BodyContainer as getBody } from './Body';

export class PageList extends Page {
    bodyMobile() {
        const BodyMobile = getBodyMobile(this.props.pageIndex);

        return <BodyMobile />;
    }
    renderListMobile(render) {
        if (!render) {
            return null;
        }

        return <div>{this.bodyMobile()}</div>;
    }
    bodyDesktop () {
        const Body = getBody(this.props.pageIndex);

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
        if (!this.props.loaded) {
            return null;
        }

        const listClasses = [
            'list-insert',
            `list-${PAGES[this.props.pageIndex]}`,
            'list'
        ].join(' ');

        const listRendered = this.renderList();
        const afterList = this.afterList();

        const pageClasses = `page-${PAGES[this.props.pageIndex]}`;

        return <div className={pageClasses}>
            <div className={listClasses}>
                {listRendered}
            </div>
            {afterList}
        </div>;
    }
}

PageList.propTypes = {
    loaded: PropTypes.bool.isRequired,
    pageIndex: PropTypes.number.isRequired,
    loadContent: PropTypes.func.isRequired
};

const stateDefault = pageIndex => state => ({
    pageIndex,
    loaded: Boolean(state.getIn(['pagesLoaded', pageIndex]))
});

const dispatchDefault = () => dispatch => ({
    loadContent: req => dispatch(aContentRequested(req)),
    handleKeyPress: req => dispatch(aKeyPressed(req))
});

export const PageListContainer = pageIndex =>
    extendableContainer(stateDefault, dispatchDefault)(pageIndex)()(PageList);

export default extendableContainer(stateDefault, dispatchDefault);

