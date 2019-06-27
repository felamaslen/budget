import './style.scss';
import { connect } from 'react-redux';
import { aMobileAddDialogOpened } from '~client/actions/form.actions';
import { aListItemAdded } from '~client/actions/edit.actions';
import { getDailyTotals, getWeeklyAverages, getTotalCost } from '~client/selectors/list';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import classNames from 'classnames';

import { rowsShape, dailyTotalsShape } from '~client/prop-types/page/rows';
import { mediaQueryMobile } from '~client/constants';
import { PAGES } from '~client/constants/data';
import Page from '~client/containers/Page';
import ListBodyDesktop from '~client/components/ListBodyDesktop';
import ListBodyMobile from '~client/components/ListBodyMobile';

const PageListComponent = ({
    page,
    After,
    rows,
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
}) => (
    <Page page={page}>
        <div className={classNames('list-insert', `list-${page}`, 'list')}>
            <Media query={mediaQueryMobile}>{isMobile => isMobile && (
                <ListBodyMobile
                    page={page}
                    rows={rows}
                    listColsMobile={listColsMobile}
                    onMobileAdd={onMobileAdd}
                />
            ) || (
                <ListBodyDesktop
                    page={page}
                    rows={rows}
                    getDaily={getDaily}
                    dailyTotals={dailyTotals}
                    weeklyValue={weeklyValue}
                    totalCost={totalCost}
                    addBtnFocus={addBtnFocus}
                    onDesktopAdd={onDesktopAdd}
                    AfterRow={AfterRow}
                    TotalValue={TotalValue}
                />
            )}</Media>
        </div>
        {After && <After />}
    </Page>
);

PageListComponent.propTypes = {
    page: PropTypes.string.isRequired,
    After: PropTypes.func,
    rows: rowsShape,
    getDaily: PropTypes.bool,
    dailyTotals: dailyTotalsShape,
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    addBtnFocus: PropTypes.bool.isRequired,
    onDesktopAdd: PropTypes.func.isRequired,
    AfterRow: PropTypes.func,
    TotalValue: PropTypes.func,
    listColsMobile: PropTypes.array,
    onMobileAdd: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
    rows: props.rows || state.pages[props.page].rows,
    dailyTotals: getDailyTotals(state, props),
    weeklyValue: getWeeklyAverages(state, props),
    addBtnFocus: state.edit.addBtnFocus,
    getDaily: Boolean(PAGES[props.page].daily),
    totalCost: getTotalCost(state, props)
});

const mapDispatchToProps = dispatch => ({
    onDesktopAdd: page => dispatch(aListItemAdded({ page })),
    onMobileAdd: page => dispatch(aMobileAddDialogOpened(page))
});

export const PageList = connect(mapStateToProps, mapDispatchToProps)(PageListComponent);

export const PageIncome = () => <PageList page="income" />;
export const PageBills = () => <PageList page="bills" />;
export const PageFood = () => <PageList page="food" />;
export const PageGeneral = () => <PageList page="general" />;
export const PageHoliday = () => <PageList page="holiday" />;
export const PageSocial = () => <PageList page="social" />;
