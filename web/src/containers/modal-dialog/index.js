/**
 * Displays a modal dialog for editing / adding content
 */

import { connect } from 'react-redux';

import React from 'react';
import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';
import { List as list } from 'immutable';
import classNames from 'classnames';

import { aMobileDialogClosed } from '../../actions/form.actions';

import ModalDialogField from '../../components/form-field/modal-dialog-field';

export function title(id) {
    if (id) {
        return `Editing id#${id}`;
    }

    return 'Add item';
}

export class ModalDialog extends PureComponent {
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

        const fields = this.props.fields.map(
            (field, fieldKey) => <ModalDialogField key={field.get('item')}
                field={field}
                fieldKey={fieldKey}
                invalidKeys={this.props.invalidKeys}
            />
        );

        const onCancel = () => this.props.onCancel();
        const onSubmit = () => this.props.onSubmit(this.props.pageIndex);

        return <div className={className}>
            <div className={dialogClass}>
                <span className="title">{title(this.props.id)}</span>
                <ul className="form-list">
                    {fields}
                </ul>
                <div className="buttons">
                    <button type="button" className="button-cancel"
                        disabled={this.props.loading}
                        onClick={onCancel}>nope.avi</button>
                    <button type="button" className="button-submit"
                        disabled={this.props.loading}
                        onClick={onSubmit}>Do it.</button>
                </div>;
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
};

const mapStateToProps = state => ({
    pageIndex: state.get('currentPageIndex'),
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
    onSubmit: pageIndex => dispatch(aMobileDialogClosed({ pageIndex })),
    deactivate: () => setTimeout(
        () => dispatch(aMobileDialogClosed({ deactivate: true })), 305
    )
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalDialog);

