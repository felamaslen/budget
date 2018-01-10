import { PAGES, LIST_COLS_MOBILE } from '../../../../misc/const';
import { connect } from 'react-redux';
import { aMobileAddDialogOpened } from '../../../../actions/form.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ListRowMobile from '../row/mobile';

function bodyMobile(propTypes) {
    function BodyMobile({ page, rowIds, onAdd }) {
        const colKeys = LIST_COLS_MOBILE
            .map(column => PAGES[page].cols.indexOf(column));

        const rows = rowIds.map(id => <ListRowMobile key={id} page={page} id={id} colKeys={colKeys} />);

        const listHeadInner = LIST_COLS_MOBILE.map(column => {
            const className = classNames('list-head-column', column);

            return <span key={column} className={className}>{column}</span>;
        });

        return <div>
            <div className="list-head noselect">
                {listHeadInner}
            </div>
            <ul className="list-ul">{rows}</ul>
            <div className="button-add-outer">
                <button type="button" className="button-add" onClick={() => onAdd()}>{'Add'}</button>
            </div>
        </div>;
    }

    BodyMobile.propTypes = {
        ...propTypes,
        onAdd: PropTypes.func.isRequired
    };

    return BodyMobile;
}

const mapDispatchToProps = (dispatch, { page }) => ({
    onAdd: () => dispatch(aMobileAddDialogOpened(page))
});

export default (propTypes, mapStateToProps) =>
    connect(mapStateToProps, mapDispatchToProps)(bodyMobile(propTypes));

