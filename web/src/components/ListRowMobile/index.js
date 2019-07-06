import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { rowShape } from '~client/prop-types/page/rows';
import ModalDialog from '~client/components/ModalDialog';
import Editable from '~client/components/Editable';
import { PAGES, LIST_COLS_MOBILE } from '~client/constants/data';

export function useFields(page) {
    const fields = useMemo(() => PAGES[page].cols.map(item => ({
        item,
        value: ''
    })), [page]);

    return fields;
}

export default function ListRowMobile({ page, item, active, setActive, onUpdate, listColsMobile, AfterRowMobile }) {
    const onOpenModal = useCallback(() => setActive(item.id), [setActive, item.id]);

    const onCloseModal = useCallback(event => {
        event.stopPropagation();
        setActive(null);
    }, [setActive]);

    const onSubmit = useCallback(newItem => {
        onUpdate(page, item.id, newItem, item);
    }, [onUpdate, page, item]);

    const fields = useFields(page);

    return (
        <li onClick={onOpenModal}>
            {listColsMobile.map(column => (
                <span key={column} className={column}>
                    <Editable
                        item={column}
                        value={item[column]}
                    />
                </span>
            ))}
            {AfterRowMobile && <AfterRowMobile item={item} />}
            <ModalDialog
                type="add"
                fields={fields}
                active={active}
                onCancel={onCloseModal}
                onSubmit={onSubmit}
            />
        </li>
    );
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    item: rowShape.isRequired,
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    listColsMobile: PropTypes.array,
    AfterRowMobile: PropTypes.func
};

ListRowMobile.defaultProps = {
    listColsMobile: LIST_COLS_MOBILE
};
