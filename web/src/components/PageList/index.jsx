/**
 * List page component
 */

import extendableContainer from '../containerExtender';

import { aContentRequested } from '../../actions/ContentActions';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries, PAGES } from '../../misc/const';

import { HeadMobileContainer as getHeadMobile } from './HeadMobile';
import { BodyMobileContainer as getBodyMobile } from './BodyMobile';

import { HeadContainer as getHead } from './Head';
import { BodyContainer as getBody } from './Body';

export class PageList extends PureComponent {
    headMobile() {
        const HeadMobile = getHeadMobile(this.props.pageIndex);

        return <HeadMobile />;
    }
    bodyMobile() {
        const BodyMobile = getBodyMobile(this.props.pageIndex);

        return <BodyMobile />;
    }
    renderListMobile(render) {
        if (!render) {
            return null;
        }

        const headMobile = this.headMobile();
        const bodyMobile = this.bodyMobile();

        return <div>{headMobile}{bodyMobile}</div>;
    }
    headDesktop () {
        const Head = getHead(this.props.pageIndex);

        return <Head />;
    }
    bodyDesktop () {
        const Body = getBody(this.props.pageIndex);

        return <Body />;
    }
    renderListDesktop(render) {
        if (!render) {
            return null;
        }

        const head = this.headDesktop();
        const body = this.bodyDesktop();

        return <div>{head}{body}</div>;
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
    componentDidMount() {
        if (!this.props.loaded) {
            this.props.loadContent({ pageIndex: this.props.pageIndex });
        }
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
    pageIndex: PropTypes.number.isRequired,
    loaded: PropTypes.bool.isRequired,
    loadContent: PropTypes.func.isRequired
};

const stateDefault = pageIndex => state => ({
    pageIndex,
    loaded: Boolean(state.getIn(['global', 'pagesLoaded', pageIndex]))
});

const dispatchDefault = () => dispatch => ({
    loadContent: req => dispatch(aContentRequested(req))
});

export const PageListContainer = pageIndex =>
    extendableContainer(stateDefault, dispatchDefault)(pageIndex)()(PageList);

export default extendableContainer(stateDefault, dispatchDefault);

