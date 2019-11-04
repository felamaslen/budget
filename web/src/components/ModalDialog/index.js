import React, {
    useRef,
    useState,
    useReducer,
    useEffect,
    useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import compose from 'just-compose';
import { DateTime } from 'luxon';

import { replaceAtIndex } from '~client/modules/data';
import { validateField } from '~client/modules/validate';
import ModalDialogField from '~client/components/ModalDialog/field';

import * as Styled from './styles';
import './style.scss';

function getTitle({ type, id }) {
    if (type === 'edit') {
        return `Editing id#${id}`;
    }

    return 'Add item';
}

export const animationTime = 350;

const withDefaultDate = fields =>
    replaceAtIndex(
        fields,
        fields.findIndex(({ item, value }) => item === 'date' && !value),
        { item: 'date', value: DateTime.local() },
    );

const HIDDEN = 'HIDDEN';
const SHOWN = 'SHOWN';
const CHANGED_ID = 'CHANGED_ID';

const updatePersistentState = (state, { payload }) => ({
    ...state,
    title: getTitle(payload),
    canRemove: Boolean(payload.onRemove),
});

function reducer(state, action) {
    if (action.type === HIDDEN) {
        return {
            ...state,
            visible: false,
        };
    }
    if (action.type === SHOWN) {
        return {
            ...updatePersistentState(state, action),
            visible: true,
        };
    }
    if (action.type === CHANGED_ID) {
        return updatePersistentState(state, action);
    }

    return state;
}

export default function ModalDialog({
    active,
    loading,
    id,
    fields,
    type,
    onCancel,
    onSubmit,
    onRemove,
}) {
    const [state, dispatch] = useReducer(reducer, {
        title: getTitle({ type, id }),
        canRemove: Boolean(onRemove),
        visible: active,
    });

    const timer = useRef(null);
    const { title, canRemove, visible } = state;

    useEffect(() => {
        if (active && !visible) {
            dispatch({ type: SHOWN, payload: { type, id, onRemove } });
        } else if (!active && visible) {
            clearTimeout(timer.current);
            timer.current = setTimeout(
                () => dispatch({ type: HIDDEN }),
                animationTime,
            );
        } else {
            dispatch({ type: CHANGED_ID, payload: { type, id, onRemove } });
        }
    }, [type, id, onRemove, active, visible]);

    useEffect(() => () => clearTimeout(timer.current), []);

    const [tempFields, setTempFields] = useState();
    useEffect(() => {
        setTempFields(compose(withDefaultDate)(fields.slice()));
    }, [fields]);

    const [invalid, setInvalid] = useState({});

    const onChangeField = useCallback(
        (item, value) =>
            setTempFields(last =>
                replaceAtIndex(
                    last,
                    last.findIndex(({ item: thisItem }) => thisItem === item),
                    { item, value },
                ),
            ),
        [],
    );

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
            onSubmit(
                tempFields.reduce(
                    (last, { item, value }) => ({ ...last, [item]: value }),
                    { id },
                ),
            );
        }
    }, [onSubmit, tempFields, id]);

    useEffect(() => {
        if (!active && Object.keys(invalid).length) {
            setInvalid({});
        }
    }, [active, invalid]);

    if (!visible) {
        return null;
    }

    return (
        <Styled.ModalDialog className={classNames('modal-dialog', type)}>
            <div
                className={classNames('modal-dialog-inner', {
                    hidden: !active,
                    loading,
                })}
            >
                <span className="title">{title}</span>
                <ul className="form-list">
                    {fields.map(({ item, value }) => (
                        <ModalDialogField
                            key={item}
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
                    >
                        {'nope.avi'}
                    </button>
                    <button
                        type="button"
                        className="button-submit"
                        disabled={loading}
                        onClick={onSubmitCallback}
                    >
                        {'Do it.'}
                    </button>
                    {canRemove && (
                        <button
                            type="button"
                            className="button-remove"
                            disabled={loading}
                            onClick={onRemove}
                        >
                            &minus;
                        </button>
                    )}
                </div>
            </div>
        </Styled.ModalDialog>
    );
}

ModalDialog.propTypes = {
    active: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    type: PropTypes.string,
    id: PropTypes.string,
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            item: PropTypes.string.isRequired,
            value: PropTypes.any,
        }),
    ),
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
};

ModalDialog.defaultProps = {
    active: true,
    loading: false,
    type: 'edit',
    id: null,
    fields: [],
    onRemove: null,
};
