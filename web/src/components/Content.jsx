/**
 * Calls different page components
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { Map as map, List as list } from 'immutable';
import { PAGES, LIST_PAGES, DAILY_PAGES } from '../misc/const';

import { Spinner } from './Spinner';
import { ModalDialog } from './ModalDialog';
import { PageOverview } from './pages/PageOverview';
import { PageList } from './pages/PageList';
import { PageAnalysis } from './pages/PageAnalysis';
import { PageFunds } from './pages/PageFunds';

export class Content extends PureControllerView {
    renderPage() {
        const data = this.props.pages.get(this.props.index);
        const page = PAGES[this.props.index];
        if (page === 'overview') {
            // overview page
            return (
                <PageOverview dispatcher={this.props.dispatcher}
                    data={data}
                    edit={this.props.edit.get('active')}
                    showAll={this.props.other.get('showAllBalanceGraph')} />
            );
        }
        if (page === 'analysis') {
            return (
                <PageAnalysis dispatcher={this.props.dispatcher}
                    other={this.props.other.get('analysis')}
                    cost={data.get('cost')}
                    costTotal={data.get('costTotal')}
                    items={data.get('items')}
                    description={data.get('description')}
                    blocks={this.props.other.get('blockView')}
                />
            );
        }
        if (page === 'funds') {
            // funds page
            return (
                <PageFunds dispatcher={this.props.dispatcher}
                    data={data}
                    edit={this.props.edit.get('active')}
                    add={this.props.edit.get('add')}
                    addBtnFocus={this.props.edit.get('addBtnFocus')}
                    daily={DAILY_PAGES[this.props.index]}
                    index={this.props.index}
                    page={page}
                    graphProps={this.props.other.get('graphFunds')}
                    stocksListProps={this.props.other.get('stocksList')}
                    cachedValue={this.props.other.get('fundsCachedValue')}
                    suggestions={null} />
            );
        }
        if (LIST_PAGES.indexOf(this.props.index) > -1) {
            // list page (e.g. food)
            return (
                <PageList dispatcher={this.props.dispatcher}
                    data={data}
                    edit={this.props.edit.get('active')}
                    add={this.props.edit.get('add')}
                    addBtnFocus={this.props.edit.get('addBtnFocus')}
                    daily={DAILY_PAGES[this.props.index]}
                    index={this.props.index}
                    page={page}
                    suggestions={this.props.edit.get('suggestions')}
                    blocks={this.props.other.get('blockView')}
                />
            );
        }

        return <div>TODO: page {this.props.index}</div>;
    }
    renderModalDialog() {
        if (!this.props.modalDialog.get('active')) {
            return null;
        }

        return <ModalDialog
            dispatcher={this.props.dispatcher}
            type={this.props.modalDialog.get('type')}
            pageIndex={this.props.index}
            row={this.props.modalDialog.get('row')}
            col={this.props.modalDialog.get('col')}
            id={this.props.modalDialog.get('id')}
            fields={this.props.modalDialog.get('fields')}
        />;
    }
    render() {
        if (!this.props.loaded.get(this.props.index)) {
            return <Spinner />;
        }

        const page = this.renderPage();

        const className = `page-wrapper page-${PAGES[this.props.index]}`;

        const modalDialog = this.renderModalDialog();

        return (
            <div className={className}>
                <div className="inner">
                    {page}
                </div>
                {modalDialog}
            </div>
        );
    }
}

Content.propTypes = {
    pages: PropTypes.instanceOf(list),
    loaded: PropTypes.instanceOf(list),
    add: PropTypes.instanceOf(list),
    addBtnFocus: PropTypes.bool,
    edit: PropTypes.instanceOf(map),
    modalDialog: PropTypes.instanceOf(map),
    other: PropTypes.instanceOf(map),
    index: PropTypes.number
};

