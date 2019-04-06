import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PAGES } from '~client/constants/data';
import ListAddEditItem from '~client/containers/Editable/list-item';

export default function AddForm({ page, addBtnFocus, onAdd }) {
    const addBtn = useRef(null);
    const [wasFocused, setWasFocused] = useState(false);

    useEffect(() => {
        if (addBtn.current && addBtn.current.focus && !wasFocused && addBtnFocus) {
            setImmediate(() => addBtn.current.focus());
        }

        setWasFocused(addBtnFocus);

    }, [addBtnFocus, wasFocused]);

    const addItems = useMemo(() => PAGES[page].cols.map((item, col) => (
        <ListAddEditItem
            key={col}
            page={page}
            row={-1}
            col={col}
            id={null}
        />
    )), [page]);

    const onClick = useCallback(() => onAdd(page), [onAdd, page]);

    return (
        <li className="li-add">
            {addItems}
            <span className="add-button-outer">
                <button ref={addBtn} onClick={onClick}>{'Add'}</button>
            </span>
        </li>
    );
}

AddForm.propTypes = {
    page: PropTypes.string.isRequired,
    addBtnFocus: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired
};

