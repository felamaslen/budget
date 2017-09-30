/**
 * List page component
 */

import { List as list } from 'immutable';
import extendableContainer from '../containerExtender';

import { aContentRequested } from '../../actions/ContentActions';
import {
    aMobileEditDialogOpened,
    aMobileAddDialogOpened
} from '../../actions/FormActions';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries, PAGES, LIST_COLS_PAGES } from '../../misc/const';

import { HeadContainer as getHead } from './Head';
import { BodyContainer as getBody } from './Body';

export class PageList extends PureComponent {
    /*
    renderListHeadMobile(columns) {
        return (
            <div className="list-head noselect">
                {this.renderListHeadMain(columns)}
            </div>
        );
    }
    renderListRowItemsMobile(row, rowKey, columns, colKeys) {
        const id = row.get('id');

        return columns
            .map((column, key) => {
                const colKey = colKeys[key];
                const value = row.getIn(['cols', colKey]);

                return this.renderListItem(rowKey, colKey, id, column, value);
            });
    }
    renderListRowMobile(row, rowKey, columns, colKeys) {
        const items = this.renderListRowItemsMobile(row, rowKey, columns, colKeys);

        const onClick = () => this.props.openMobileEditDialog(rowKey);

        return <li onClick={onClick} key={rowKey}>{items}</li>;
    }
    renderAddButton() {
        const onClick = () => this.props.openMobileAddDialog();

        return <div className="button-add-outer">
            <button type="button" className="button-add" onClick={onClick}>
                Add
            </button>
        </div>;
    }
    renderListMobile(render) {
        if (!render) {
            return null;
        }

        const columns = ['date', 'item', 'cost'];
        const colKeys = columns
            .map(column => LIST_COLS_PAGES[this.props.pageIndex].indexOf(column));

        const rows = this.props.rows.map(
            (row, rowKey) => this.renderListRowMobile(row, rowKey, columns, colKeys)
        );

        return <div>
            {this.renderListHeadMobile(columns)}
            <ul className="list-ul">{rows}</ul>
            {this.renderAddButton()}
        </div>;
    }
    */
    getHead() {
        return getHead(this.props.pageIndex);
    }
    getBody() {
        return getBody(this.props.pageIndex);
    }
    renderListDesktop(render) {
        if (!render) {
            return null;
        }

        const Head = this.getHead();
        const Body = this.getBody();

        return <div>
            <Head />
            <Body />
        </div>;
    }
    renderList() {
        // <Media query={mediaQueries.mobile}>{render => this.renderListMobile(render)}</Media>

        return <div>
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
    loadContent: PropTypes.func.isRequired,
    openMobileEditDialog: PropTypes.func.isRequired,
    openMobileAddDialog: PropTypes.func.isRequired
};

const stateDefault = pageIndex => state => ({
    pageIndex,
    loaded: Boolean(state.getIn(['global', 'pagesLoaded', pageIndex]))
});

const dispatchDefault = pageIndex => dispatch => ({
    loadContent: req => dispatch(aContentRequested(req)),
    openMobileEditDialog: rowKey => dispatch(
        aMobileEditDialogOpened(pageIndex, rowKey)
    ),
    openMobileAddDialog: () => dispatch(aMobileAddDialogOpened(pageIndex))
});

export const PageListContainer = pageIndex =>
    extendableContainer(stateDefault, dispatchDefault)(pageIndex)()(PageList);

export default extendableContainer(stateDefault, dispatchDefault);

