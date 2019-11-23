import React, { useContext, useCallback, useMemo } from 'react';

import { PageContext, NavContext } from '~client/context';
import { Button } from '~client/styled/shared/button';
import ModalDialog from '~client/components/ModalDialog';
import { CREATE_ID, PAGES } from '~client/constants/data';

import * as Styled from './styles';

export default function ListFootMobile() {
    const page = useContext(PageContext);
    const { active, setActive, activeItem, onCreate, onUpdate, onDelete } = useContext(NavContext);
    const onAdd = useCallback(() => setActive(CREATE_ID), [setActive]);

    const adding = active === CREATE_ID;

    const modalDialogType = adding ? 'add' : 'edit';

    const fields = useMemo(() => {
        if (!page) {
            return [];
        }
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
            <Styled.ButtonAdd className="button-add">
                <Button
                    type="button"
                    className="button-add-button"
                    onClick={onAdd}
                    disabled={Boolean(active)}
                >
                    {'Add'}
                </Button>
            </Styled.ButtonAdd>
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
