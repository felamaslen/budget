import './style.scss';
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import classNames from 'classnames';

import { listItemCreated, listItemUpdated, listItemDeleted } from '~client/actions/list';
import {
    getSortedPageRows,
    getWeeklyAverages,
    getTotalCost
} from '~client/selectors/list';

import { rowsShape } from '~client/prop-types/page/rows';
import { mediaQueryMobile } from '~client/constants';
import { PAGES } from '~client/constants/data';
import Page from '~client/components/Page';
import ListBody from '~client/components/ListBody';

const PageListComponent = ({
    page,
    After,
    rows,
    itemSize,
    getDaily,
    weeklyValue,
    totalCost,
    extraProps,
    onCreate,
    onUpdate,
    onDelete
}) => (
    <Page page={page} className="page-list">
        <div className={classNames('page-list-main', page)}>
            <Media query={mediaQueryMobile}>{isMobile => (
                <ListBody
                    page={page}
                    isMobile={isMobile}
                    rows={rows}
                    itemSize={isMobile
                        ? null
                        : itemSize
                    }
                    getDaily={getDaily}
                    weeklyValue={weeklyValue}
                    totalCost={totalCost}
                    extraProps={extraProps}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            )}</Media>
        </div>
        {After && <After totalCost={totalCost} {...extraProps} />}
    </Page>
);

PageListComponent.propTypes = {
    page: PropTypes.string.isRequired,
    rows: rowsShape,
    itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    After: PropTypes.func,
    getDaily: PropTypes.bool,
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    extraProps: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

PageListComponent.defaultProps = {
    After: null,
    itemSize: null,
    extraProps: {}
};

const mapStateToProps = (state, props) => ({
    rows: props.rows || getSortedPageRows(state, props),
    weeklyValue: getWeeklyAverages(state, props),
    getDaily: Boolean(PAGES[props.page].daily),
    totalCost: getTotalCost(state, props)
});

const mapDispatchToProps = {
    onCreate: listItemCreated,
    onUpdate: listItemUpdated,
    onDelete: listItemDeleted
};

export const PageList = connect(mapStateToProps, mapDispatchToProps)(PageListComponent);

export const PageIncome = () => <PageList page="income" />;
export const PageBills = () => <PageList page="bills" />;
export const PageFood = () => <PageList page="food" />;
export const PageGeneral = () => <PageList page="general" />;
export const PageHoliday = () => <PageList page="holiday" />;
export const PageSocial = () => <PageList page="social" />;
