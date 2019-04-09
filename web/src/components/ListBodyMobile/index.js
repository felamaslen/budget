import './style.scss';
import { List as list, OrderedMap } from 'immutable';
import { PAGES, LIST_COLS_MOBILE } from '~client/constants/data';
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ListRowMobile from '~client/containers/ListRowMobile';

export default function ListBodyMobile({
    page,
    rows,
    rowIds,
    listColsMobile,
    onMobileAdd,
    AfterRowMobile
}) {
    const colKeys = useMemo(
        () => listColsMobile.map(column => PAGES[page].cols.indexOf(column)),
        [page, listColsMobile]
    );

    const listRows = useMemo(() => rows && rowIds.map(id => (
        <ListRowMobile key={id}
            page={page}
            colKeys={colKeys}
            id={id}
            listColsMobile={listColsMobile}
            AfterRowMobile={AfterRowMobile}
        />
    )), [page, rowIds, rows, colKeys, AfterRowMobile, listColsMobile]);

    const listHeadInner = listColsMobile.map(column => (
        <span key={column}
            className={classNames('list-head-column', column)}
        >{column}</span>
    ));

    const onAdd = useCallback(() => onMobileAdd(page), [page, onMobileAdd]);

    return (
        <div className="list-mobile">
            <div className="list-head noselect">
                {listHeadInner}
            </div>
            <ul className="list-ul">{listRows}</ul>
            <div className="button-add-outer">
                <button type="button" className="button-add" onClick={onAdd}>
                    {'Add'}
                </button>
            </div>
        </div>
    );
}

ListBodyMobile.propTypes = {
    page: PropTypes.string.isRequired,
    rows: PropTypes.instanceOf(OrderedMap),
    rowIds: PropTypes.instanceOf(list).isRequired,
    listColsMobile: PropTypes.array.isRequired,
    onMobileAdd: PropTypes.func.isRequired,
    AfterRowMobile: PropTypes.func
};

ListBodyMobile.defaultProps = {
    listColsMobile: LIST_COLS_MOBILE
};

