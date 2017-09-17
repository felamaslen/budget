/**
 * Displays a modal dialog for editing / adding content
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { List as list } from 'immutable';

import getFormField from './FormField';

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

                return <span key={fieldKey}>
                    <span className="name">{field.get('item')}</span>
                    <span className="value">{item}</span>
                </span>;
            });
    }
    renderButtons() {
        return <div className="buttons">
            <button type="button" className="button-cancel">nope.avi</button>
            <button type="button" className="button-submit">Do it.</button>
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
                {fields}
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
    fields: PropTypes.instanceOf(list)
}

