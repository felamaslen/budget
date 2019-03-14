/**
 * Displays a modal dialog for editing / adding content
 */

import { connect } from 'react-redux';
import './style.scss';
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { List as list } from 'immutable';
import classNames from 'classnames';

import { aMobileDialogClosed } from '../../actions/form.actions';

import ModalDialogField from '../../components/FormField/modal-dialog-field';

export function title(id) {
    if (id) {
        return `Editing id#${id}`;
    }

    return 'Add item';
}

export function ModalDialog({
    active,
    visible,
    loading,
    invalidKeys,
    deactivate,
    page,
    id,
    type,
    fields,
    onCancel,
    onSubmit
}) {
    const [wasVisible, setWasVisible] = useState(visible);

    useEffect(() => {
        if (!visible && wasVisible) {
            deactivate();
        }

        setWasVisible(visible);

    }, [visible]);

    const className = classNames('modal-dialog-outer', type);

    const dialogClass = classNames('dialog', { hidden: !visible, loading });

    const onSubmitClick = useCallback(() => onSubmit(page), [page, onSubmit]);

    if (!active) {
        return null;
    }

    return (
        <div className={className}>
            <div className={dialogClass}>
                <span className="title">{title(id)}</span>
                <ul className="form-list">
                    {fields.map((field, fieldKey) => (
                        <ModalDialogField key={field.get('item')}
                            field={field}
                            fieldKey={fieldKey}
                            invalidKeys={invalidKeys}
                        />
                    ))}
                </ul>
                <div className="buttons">
                    <button type="button" className="button-cancel" disabled={loading} onClick={onCancel}>
                        {'nope.avi'}
                    </button>
                    <button type="button" className="button-submit" disabled={loading} onClick={onSubmitClick}>
                        {'Do it.'}
                    </button>
                </div>
            </div>
        </div>
    );
}

ModalDialog.propTypes = {
    active: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    type: PropTypes.string,
    row: PropTypes.number,
    col: PropTypes.number,
    id: PropTypes.number,
    fields: PropTypes.instanceOf(list),
    invalidKeys: PropTypes.instanceOf(list),
    page: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    deactivate: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    page: state.get('currentPage'),
    active: state.getIn(['modalDialog', 'active']),
    visible: state.getIn(['modalDialog', 'visible']),
    loading: state.getIn(['modalDialog', 'loading']),
    type: state.getIn(['modalDialog', 'type']),
    row: state.getIn(['modalDialog', 'row']),
    col: state.getIn(['modalDialog', 'col']),
    id: state.getIn(['modalDialog', 'id']),
    fields: state.getIn(['modalDialog', 'fields']),
    invalidKeys: state.getIn(['modalDialog', 'invalidKeys'])
});

const mapDispatchToProps = dispatch => ({
    onCancel: () => dispatch(aMobileDialogClosed(null)),
    onSubmit: page => dispatch(aMobileDialogClosed({ page })),
    deactivate: () => setTimeout(
        () => dispatch(aMobileDialogClosed({ deactivate: true })), 305
    )
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalDialog);

