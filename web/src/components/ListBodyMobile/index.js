import { List as list } from 'immutable';
import { PAGES, LIST_COLS_MOBILE } from '../../constants/data';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ListRowMobile from '../../containers/ListRowMobile';

export default function ListBodyMobile({ page, rowIds, onMobileAdd, ...props }) {
    const colKeys = LIST_COLS_MOBILE
        .map(column => PAGES[page].cols.indexOf(column));

    const rows = rowIds.map(id => (
        <ListRowMobile key={id} page={page} id={id} colKeys={colKeys} {...props} />
    ));

    const listHeadInner = LIST_COLS_MOBILE.map(column => {
        const className = classNames('list-head-column', column);

        return <span key={column} className={className}>{column}</span>;
    });

    return (
        <div>
            <div className="list-head noselect">
                {listHeadInner}
            </div>
            <ul className="list-ul">{rows}</ul>
            <div className="button-add-outer">
                <button type="button" className="button-add" onClick={() => onMobileAdd(page)}>{'Add'}</button>
            </div>
        </div>
    );
}

ListBodyMobile.propTypes = {
    page: PropTypes.string.isRequired,
    rowIds: PropTypes.instanceOf(list).isRequired,
    onMobileAdd: PropTypes.func.isRequired
};

