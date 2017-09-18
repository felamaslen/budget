/**
 * Displays a modal dialog for editing / adding content
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { List as list } from 'immutable';
import classNames from 'classnames';

import getFormField from './FormField';

import { aMobileDialogClosed } from '../actions/FormActions';

export class ModalDialog extends PureControllerView {
    renderTitle() {
        if (this.props.id) {
            return `Editing id#${this.props.id}`;
        }

        return 'Add item';
    }
    renderFields() {
        return this.props.fields
            .map((field, fieldKey) => {
                const item = getFormField(this.props.dispatcher, {
                    fieldKey,
                    item: field.get('item'),
                    value: field.get('value')
                });

                const invalid = this.props.invalidKeys.includes(fieldKey);

                const className = classNames({
                    'form-row': true,
                    invalid
                });

                return <li key={fieldKey} className={className}>
                    <span className="form-label">{field.get('item')}</span>
                    {item}
                </li>;
            });
    }
    renderButtons() {
        const onCancel = () => this.props.dispatcher.dispatch(aMobileDialogClosed(null));
        const onSubmit = () => this.props.dispatcher.dispatch(aMobileDialogClosed(
            this.props.pageIndex
        ));

        return <div className="buttons">
            <button type="button" className="button-cancel"
                onClick={onCancel}>nope.avi</button>
            <button type="button" className="button-submit"
                onClick={onSubmit}>Do it.</button>
        </div>;
    }
    render() {
        const className = `modal-dialog-outer ${this.props.type}`;
        const title = this.renderTitle();
        const fields = this.renderFields();
        const buttons = this.renderButtons();

        return <div className={className}>
            <div className="dialog">
                <span className="title">{title}</span>
                <ul className="form-list">
                    {fields}
                </ul>
                {buttons}
            </div>
        </div>;
    }
}

ModalDialog.propTypes = {
    type: PropTypes.string,
    pageIndex: PropTypes.number,
    row: PropTypes.number,
    col: PropTypes.number,
    id: PropTypes.number,
    fields: PropTypes.instanceOf(list),
    invalidKeys: PropTypes.instanceOf(list)
}

