import React, { useState, useRef, useEffect, useCallback } from 'react';
import memoize from 'fast-memoize';
import compose from 'just-compose';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { ListRowDesktopBase } from '~client/components/ListRowDesktop';
import { IDENTITY, fieldExists } from '~client/modules/data';
import { PAGES, CREATE_ID } from '~client/constants/data';
import { ADD_BTN } from '~client/hooks/nav';

const withInitialValue = (column, initialValue) => page => {
    if (!PAGES[page].cols.includes(column)) {
        return IDENTITY;
    }

    return values => ({ ...values, [column]: initialValue() });
};

const withDate = withInitialValue('date', DateTime.local);
const withTransactions = withInitialValue('transactions', () => ([]));

const initialValues = memoize(page => compose(
    withDate(page),
    withTransactions(page)
)({ id: CREATE_ID }));

export default function ListCreateDesktop({
    page,
    activeColumn,
    command,
    setCommand,
    setActive,
    onCreate
}) {
    const addBtn = useRef(null);
    const addBtnFocus = activeColumn === ADD_BTN;
    const [wasFocused, setWasFocused] = useState(false);

    useEffect(() => {
        if (addBtnFocus && !wasFocused) {
            setWasFocused(true);
            if (addBtn.current && addBtn.current.focus) {
                addBtn.current.focus();
            }
        } else if (!addBtnFocus && wasFocused) {
            setWasFocused(false);
            if (addBtn.current && addBtn.current.blur) {
                addBtn.current.blur();
            }
        }
    }, [addBtnFocus, wasFocused]);

    const [values, setValues] = useState(initialValues(page));

    const onUpdate = useCallback((column, value) => setValues(last => ({ ...last, [column]: value })), []);

    const onAddPre = useCallback(() => {
        setActive(CREATE_ID, null);
    }, [setActive]);

    const onAdd = useCallback(() => {
        if (!Object.keys(values).every(key => fieldExists(values[key]))) {
            return;
        }

        onCreate(page, values);
        setValues(initialValues(page));
        setActive(CREATE_ID, 'date');
    }, [onCreate, setActive, page, values]);

    return (
        <div className="list-row-desktop list-row-desktop-create">
            <ListRowDesktopBase
                item={values}
                page={page}
                activeColumn={activeColumn}
                setActive={setActive}
                command={command}
                setCommand={setCommand}
                onUpdate={onUpdate}
            />
            <span className="add-button-outer">
                <button
                    ref={addBtn}
                    aria-label="add-button"
                    onMouseDown={onAddPre}
                    onClick={onAdd}
                >{'Add'}</button>
            </span>
        </div>
    );
}

ListCreateDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    activeColumn: PropTypes.string,
    command: PropTypes.object,
    setCommand: PropTypes.func.isRequired,
    setActive: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired
};
