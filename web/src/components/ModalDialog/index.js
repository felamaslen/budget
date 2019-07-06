import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { replaceAtIndex } from '~client/modules/data';
import { validateField } from '~client/modules/validate';
import ModalDialogField from '~client/components/ModalDialog/field';

import './style.scss';

export function title(id) {
    if (id) {
        return `Editing id#${id}`;
    }

    return 'Add item';
}

export const animationTime = 350;

export default function ModalDialog({
    active,
    loading,
    id,
    fields,
    type,
    onCancel,
    onSubmit,
    onRemove
}) {
    const [visible, setVisible] = useState(active);
    const timer = useRef(null);

    useEffect(() => {
        if (active && !visible) {
            setVisible(true);
        } else if (!active && visible) {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setVisible(false), animationTime);
        }
    }, [active, visible]);

    const [tempFields, setTempFields] = useState(fields.slice());
    const [invalid, setInvalid] = useState({});

    const onChangeField = useCallback((item, value) => setTempFields(last => replaceAtIndex(
        last,
        last.findIndex(({ item: thisItem }) => thisItem === item),
        { item, value }
    )), []);

    const onSubmitCallback = useCallback(() => {
        const nextInvalid = tempFields.reduce((last, { item, value }) => {
            try {
                validateField(item, value);

                return last;
            } catch (err) {
                return { ...last, [item]: true };
            }
        }, {});

        setInvalid(nextInvalid);

        if (!Object.keys(nextInvalid).length) {
            onSubmit(tempFields.reduce((last, { item, value }) => ({ ...last, [item]: value }), { id }));
        }
    }, [onSubmit, tempFields, id]);

    if (!visible) {
        return null;
    }

    return (
        <div className={classNames('modal-dialog-outer', type)}>
            <div className={classNames('dialog', { hidden: !active, loading })}>
                <span className="title">{title(id)}</span>
                <ul className="form-list">
                    {fields.map(({ item, value }) => (
                        <ModalDialogField key={item}
                            item={item}
                            value={value}
                            invalid={Boolean(invalid[item])}
                            onChange={onChangeField}
                        />
                    ))}
                </ul>
                <div className="buttons">
                    <button
                        type="button"
                        className="button-cancel"
                        disabled={loading}
                        onClick={onCancel}
                    >{'nope.avi'}</button>
                    <button
                        type="button"
                        className="button-submit"
                        disabled={loading}
                        onClick={onSubmitCallback}
                    >{'Do it.'}</button>
                    <button
                        type="button"
                        className="button-remove"
                        disabled={loading}
                        onClick={onRemove}
                    >&minus;</button>
                </div>
            </div>
        </div>
    );
}

ModalDialog.propTypes = {
    active: PropTypes.bool,
    loading: PropTypes.bool,
    type: PropTypes.string,
    id: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape({
        item: PropTypes.string.isRequired,
        value: PropTypes.any
    })),
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onRemove: PropTypes.func
};

ModalDialog.defaultProps = {
    active: true,
    loading: false,
    type: 'edit',
    id: null,
    fields: [],
    onRemove: () => null
};
