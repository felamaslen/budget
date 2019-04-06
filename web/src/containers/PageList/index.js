import './style.scss';
import { connect } from 'react-redux';
import { aMobileAddDialogOpened } from '~client/actions/form.actions';
import { aListItemAdded } from '~client/actions/edit.actions';
import { makeGetRowIds, makeGetDailyTotals, makeGetWeeklyAverages } from '~client/selectors/list';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PAGES } from '~client/constants/data';
import Page from '../Page';
import ListBody from '~client/components/ListBody';

function PageList(props) {
    const { page, After } = props;

    const className = classNames('list-insert', `list-${page}`, 'list');

    let after = null;
    if (After) {
        after = <After {...props} />;
    }

    return (
        <Page {...props}>
            <div className={className}>
                <ListBody {...props} />
            </div>
            {after}
        </Page>
    );
}

PageList.propTypes = {
    page: PropTypes.string.isRequired,
    After: PropTypes.func
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

export default connect(makeMapStateToProps, mapDispatchToProps)(PageList);

