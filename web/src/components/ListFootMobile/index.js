import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Button } from '~client/styled/shared/button';
import ModalDialog from '~client/components/ModalDialog';
import { CREATE_ID, PAGES } from '~client/constants/data';

export default function ListFootMobile({
    page,
    active,
    setActive,
    activeItem,
    onCreate,
    onUpdate,
    onDelete,
}) {
    const onAdd = useCallback(() => setActive(CREATE_ID), [setActive]);

    const adding = active === CREATE_ID;

    const modalDialogType = adding ? 'add' : 'edit';

    const fields = useMemo(() => {
        if (!activeItem) {
            return PAGES[page].cols.map(item => ({ item }));
        }

        return PAGES[page].cols.map(item => ({
            item,
            value: activeItem[item],
        }));
    }, [page, activeItem]);

    const onSubmitEdit = useCallback(
        newItem => {
            if (!activeItem) {
                return;
            }
            onUpdate(page, activeItem.id, newItem, activeItem);
        },
        [onUpdate, page, activeItem],
    );

    const onSubmitAdd = useCallback(
        newItem => {
            onCreate(page, newItem);
            setActive(null);
        },
        [page, onCreate, setActive],
    );

    const onSubmit = useCallback(
        newItem => {
            if (adding) {
                onSubmitAdd(newItem);
            } else {
                onSubmitEdit(newItem);
            }

            setActive(null);
        },
        [adding, onSubmitAdd, onSubmitEdit, setActive],
    );

    const onRemove = useMemo(() => {
        if (!active || adding) {
            return null;
        }

        return () => {
            setActive(null);
            onDelete(activeItem.id, { page }, activeItem);
        };
    }, [setActive, onDelete, page, active, adding, activeItem]);

    const onCloseModal = useCallback(
        event => {
            event.stopPropagation();
            setActive(null);
        },
        [setActive],
    );

    return (
        <>
            <div className="button-add">
                <Button
                    type="button"
                    className="button-add-button"
                    onClick={onAdd}
                    disabled={Boolean(active)}
                >
                    {'Add'}
                </Button>
            </div>
            {(!active || typeof active === 'string') && (
                <ModalDialog
                    type={modalDialogType}
                    active={Boolean(active)}
                    id={active}
                    fields={fields}
                    onCancel={onCloseModal}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                />
            )}
        </>
    );
}

ListFootMobile.propTypes = {
    page: PropTypes.string.isRequired,
    active: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    setActive: PropTypes.func.isRequired,
    activeItem: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ListFootMobile.defaultProps = {
    activeItem: null,
};
