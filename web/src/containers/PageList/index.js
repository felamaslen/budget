import './style.scss';
import { OrderedMap, List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aMobileAddDialogOpened } from '~client/actions/form.actions';
import { aListItemAdded } from '~client/actions/edit.actions';
import { makeGetRowIds, makeGetDailyTotals, makeGetWeeklyAverages } from '~client/selectors/list';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import classNames from 'classnames';

import { mediaQueryMobile } from '~client/constants';
import { PAGES } from '~client/constants/data';
import Page from '~client/containers/Page';
import ListBodyDesktop from '~client/components/ListBodyDesktop';
import ListBodyMobile from '~client/components/ListBodyMobile';

function PageListComponent({
    page,
    After,
    rows,
    rowIds,
    getDaily,
    dailyTotals,
    weeklyValue,
    totalCost,
    addBtnFocus,
    onDesktopAdd,
    AfterRow,
    TotalValue,
    listColsMobile,
    onMobileAdd
}) {
    const className = classNames('list-insert', `list-${page}`, 'list');

    const bodyProps = {
        page,
        rows,
        rowIds
    };

    return (
        <Page page={page}>
            <div className={className}>
                <Media query={mediaQueryMobile}>
                    {isMobile => isMobile && (
                        <ListBodyMobile
                            {...bodyProps}
                            listColsMobile={listColsMobile}
                            onMobileAdd={onMobileAdd}
                        />
                    ) ||
                    (
                        <ListBodyDesktop
                            {...bodyProps}
                            getDaily={getDaily}
                            dailyTotals={dailyTotals}
                            weeklyValue={weeklyValue}
                            totalCost={totalCost}
                            addBtnFocus={addBtnFocus}
                            onDesktopAdd={onDesktopAdd}
                            AfterRow={AfterRow}
                            TotalValue={TotalValue}
                        />
                    )}
                </Media>
            </div>
            {After && <After />}
        </Page>
    );
}

PageListComponent.propTypes = {
    page: PropTypes.string.isRequired,
    After: PropTypes.func,
    rows: PropTypes.instanceOf(OrderedMap),
    rowIds: PropTypes.instanceOf(list),
    getDaily: PropTypes.bool,
    dailyTotals: PropTypes.instanceOf(map),
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    addBtnFocus: PropTypes.bool.isRequired,
    onDesktopAdd: PropTypes.func.isRequired,
    AfterRow: PropTypes.func,
    TotalValue: PropTypes.func,
    listColsMobile: PropTypes.array,
    onMobileAdd: PropTypes.func.isRequired
};

const makeMapStateToProps = () => {
    const getRowIds = makeGetRowIds();
    const getDailyTotals = makeGetDailyTotals();
    const getWeeklyAverages = makeGetWeeklyAverages();

    return (state, props) => ({
        rows: props.rows || state.getIn(['pages', props.page, 'rows']),
        rowIds: getRowIds(state, props),
        dailyTotals: getDailyTotals(state, props),
        weeklyValue: getWeeklyAverages(state, props),
        addBtnFocus: state.getIn(['edit', 'addBtnFocus']),
        getDaily: Boolean(PAGES[props.page].daily),
        totalCost: state.getIn(['pages', props.page, 'data', 'total'])
    });
};

const mapDispatchToProps = dispatch => ({
    onDesktopAdd: page => dispatch(aListItemAdded({ page })),
    onMobileAdd: page => dispatch(aMobileAddDialogOpened(page))
});

export const PageList = connect(makeMapStateToProps, mapDispatchToProps)(PageListComponent);

export const PageIncome = () => <PageList page="income" />;
export const PageBills = () => <PageList page="bills" />;
export const PageFood = () => <PageList page="food" />;
export const PageGeneral = () => <PageList page="general" />;
export const PageHoliday = () => <PageList page="holiday" />;
export const PageSocial = () => <PageList page="social" />;

