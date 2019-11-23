import { connect } from 'react-redux';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import classNames from 'classnames';

import { listItemCreated, listItemUpdated, listItemDeleted } from '~client/actions/list';
import { getSortedPageRows, getWeeklyAverages, getTotalCost } from '~client/selectors/list';

import { rowsShape } from '~client/prop-types/page/rows';
import { PageContext, ListContext } from '~client/context';
import { mediaQueryMobile } from '~client/constants';
import { PAGES } from '~client/constants/data';
import ListBody from '~client/components/ListBody';

import * as Styled from './styles';

function PageListComponent({
    page,
    After,
    rows,
    itemSize,
    getDaily,
    weeklyValue,
    totalCost,
    TotalValue,
    extraContext,
    onCreate,
    onUpdate,
    onDelete,
}) {
    const listContext = useMemo(
        () => ({ getDaily, weeklyValue, totalCost, TotalValue, ...extraContext }),
        [getDaily, weeklyValue, totalCost, TotalValue, extraContext],
    );

    return (
        <PageContext.Provider value={page}>
            <ListContext.Provider value={listContext}>
                <Styled.PageListMain page={page} className={classNames('page-list-main', page)}>
                    <Media query={mediaQueryMobile}>
                        {isMobile => (
                            <ListBody
                                isMobile={isMobile}
                                rows={rows}
                                itemSize={isMobile ? null : itemSize}
                                getDaily={getDaily}
                                weeklyValue={weeklyValue}
                                totalCost={totalCost}
                                onCreate={onCreate}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        )}
                    </Media>
                </Styled.PageListMain>
                {After && <After />}
            </ListContext.Provider>
        </PageContext.Provider>
    );
}

PageListComponent.propTypes = {
    page: PropTypes.string.isRequired,
    rows: rowsShape,
    itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    After: PropTypes.func,
    getDaily: PropTypes.bool,
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    TotalValue: PropTypes.func,
    extraContext: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

PageListComponent.defaultProps = {
    After: null,
    itemSize: null,
    TotalValue: null,
    extraContext: {},
};

const mapStateToProps = (state, props) => ({
    rows: props.rows || getSortedPageRows(state, props),
    weeklyValue: getWeeklyAverages(state, props),
    getDaily: Boolean(PAGES[props.page].daily),
    totalCost: getTotalCost(state, props),
});

const mapDispatchToProps = {
    onCreate: listItemCreated,
    onUpdate: listItemUpdated,
    onDelete: listItemDeleted,
};

export const PageListBase = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PageListComponent);

const PageList = ({ page }) => (
    <Styled.PageList page={page} className={classNames('page', 'page-list', `page-${page}`)}>
        <PageListBase page={page} />
    </Styled.PageList>
);

PageList.propTypes = {
    page: PropTypes.string.isRequired,
};

export const PageIncome = () => <PageList page="income" />;
export const PageBills = () => <PageList page="bills" />;
export const PageFood = () => <PageList page="food" />;
export const PageGeneral = () => <PageList page="general" />;
export const PageHoliday = () => <PageList page="holiday" />;
export const PageSocial = () => <PageList page="social" />;
