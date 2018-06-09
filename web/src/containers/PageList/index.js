import './style.scss';
import { connect } from 'react-redux';
import { aMobileAddDialogOpened } from '../../actions/form.actions';
import { aListItemAdded } from '../../actions/edit.actions';
import { makeGetRowIds } from '../../selectors/list';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PAGES } from '../../constants/data';
import Page from '../Page';
import ListBody from '../../components/ListBody';

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

    return (state, { page }) => ({
        rowIds: getRowIds(state, { page }),
        addBtnFocus: state.getIn(['edit', 'addBtnFocus']),
        weeklyValue: state.getIn(['pages', page, 'data', 'weekly']),
        getDaily: Boolean(PAGES[page].daily),
        totalCost: state.getIn(['pages', page, 'data', 'total'])
    });
};

const mapDispatchToProps = dispatch => ({
    onDesktopAdd: page => dispatch(aListItemAdded({ page })),
    onMobileAdd: page => dispatch(aMobileAddDialogOpened(page))
});

export default connect(makeMapStateToProps, mapDispatchToProps)(PageList);

