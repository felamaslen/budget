import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { CREATE_ID } from '~client/components/CrudList';
import ModalDialog from '~client/components/ModalDialog';
import { useFields } from '~client/components/ListRowMobile';

export default function ListCreateMobile({ page, active, setActive, onCreate }) {
    const onToggleModal = useCallback(() => {
        setActive(last => {
            if (last === CREATE_ID) {
                return null;
            }

            return CREATE_ID;
        });
    }, [setActive]);

    const onSubmit = useCallback(newItem => {
        onCreate(page, newItem);
        setActive(null);
    }, [page, onCreate, setActive]);

    const fields = useFields(page);

    return (
        <>
            <div className="button-add-outer">
                <button type="button" className="button-add" onClick={onToggleModal}>
                    {'Add'}
                </button>
            </div>
            <ModalDialog
                type="add"
                fields={fields}
                active={active}
                onCancel={onToggleModal}
                onSubmit={onSubmit}
            />
        </>
    );
}

ListCreateMobile.propTypes = {
    page: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired
};
