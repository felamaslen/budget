/**
 * Displays a modal dialog for editing / adding content
 */

import { connect } from 'react-redux';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List as list } from 'immutable';
import classNames from 'classnames';

import getFormField from './FormField';

import { aMobileDialogClosed } from '../actions/FormActions';

export class ModalDialog extends Component {
    renderTitle() {
        if (this.props.id) {
            return `Editing id#${this.props.id}`;
        }

        return 'Add item';
    }
    renderFields() {
        return this.props.fields
            .map((field, fieldKey) => {
                const FieldContainer = getFormField({
                    fieldKey,
                    item: field.get('item'),
                    value: field.get('value')
                });

                const invalid = this.props.invalidKeys.includes(fieldKey);

                const className = classNames({
                    'form-row': true,
                    [field.get('item')]: true,
                    invalid
                });

                if (field.get('item') === 'transactions') {
                    return <li key={fieldKey} className={className}>
                        <div className="inner">
                            <span className="form-label">{field.get('item')}</span>
                            <FieldContainer />
                        </div>
                    </li>;
                }

                return <li key={fieldKey} className={className}>
                    <span className="form-label">{field.get('item')}</span>
                    <FieldContainer />
                </li>;
            });
    }
    renderButtons() {
        const onCancel = () => this.props.onCancel();
        const onSubmit = () => {
            this.props.onSubmit(this.props.pageIndex);

            if (this.props.type !== 'add') {
                this.props.deactivate();
            }
        }

        return <div className="buttons">
            <button type="button" className="button-cancel"
                disabled={this.props.loading}
                onClick={onCancel}>nope.avi</button>
            <button type="button" className="button-submit"
                disabled={this.props.loading}
                onClick={onSubmit}>Do it.</button>
        </div>;
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.active !== this.props.active ||
            nextProps.visible !== this.props.visible ||
            nextProps.loading !== this.props.loading ||
            nextProps.invalidKeys.size !== this.props.invalidKeys.size;
    }
    componentDidUpdate(prevProps) {
        if (prevProps.visible && !this.props.visible) {
            this.props.deactivate();
        }
    }
    render() {
        if (!this.props.active) {
            return null;
        }

        const className = `modal-dialog-outer ${this.props.type}`;

        const dialogClass = classNames({
            dialog: true,
            hidden: !this.props.visible,
            loading: this.props.loading
        });

        const title = this.renderTitle();
        const fields = this.renderFields();
        const buttons = this.renderButtons();

        return <div className={className}>
            <div className={dialogClass}>
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
    active: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    type: PropTypes.string,
    row: PropTypes.number,
    col: PropTypes.number,
    id: PropTypes.number,
    fields: PropTypes.instanceOf(list),
    invalidKeys: PropTypes.instanceOf(list),
    pageIndex: PropTypes.number.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    deactivate: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    pageIndex: state.getIn(['global', 'currentPageIndex']),
    active: state.getIn(['global', 'modalDialog', 'active']),
    visible: state.getIn(['global', 'modalDialog', 'visible']),
    loading: state.getIn(['global', 'modalDialog', 'loading']),
    type: state.getIn(['global', 'modalDialog', 'type']),
    row: state.getIn(['global', 'modalDialog', 'row']),
    col: state.getIn(['global', 'modalDialog', 'col']),
    id: state.getIn(['global', 'modalDialog', 'id']),
    fields: state.getIn(['global', 'modalDialog', 'fields']),
    invalidKeys: state.getIn(['global', 'modalDialog', 'invalidKeys'])
});

const mapDispatchToProps = dispatch => ({
    onCancel: () => dispatch(aMobileDialogClosed(null)),
    onSubmit: pageIndex => dispatch(aMobileDialogClosed({ pageIndex })),
    deactivate: () => setTimeout(
        () => dispatch(aMobileDialogClosed({ deactivate: true })), 305
    )
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalDialog);
