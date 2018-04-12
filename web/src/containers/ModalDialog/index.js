/**
 * Displays a modal dialog for editing / adding content
 */

import { connect } from 'react-redux';

import React from 'react';
import PureComponent from '../../ImmutableComponent';
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
        const {
            page, id, active, type, visible, loading, fields, onCancel, onSubmit
        } = this.props;

        if (!active) {
            return null;
        }

        const className = classNames('modal-dialog-outer', type);

        const dialogClass = classNames('dialog', { hidden: !visible, loading });

        const items = fields.map((field, fieldKey) => <ModalDialogField key={field.get('item')}
            field={field}
            fieldKey={fieldKey}
            invalidKeys={this.props.invalidKeys}
        />);

        return <div className={className}>
            <div className={dialogClass}>
                <span className="title">{title(id)}</span>
                <ul className="form-list">
                    {items}
                </ul>
                <div className="buttons">
                    <button type="button" className="button-cancel" disabled={loading} onClick={onCancel}>
                        {'nope.avi'}
                    </button>
                    <button type="button" className="button-submit" disabled={loading} onClick={() => onSubmit(page)}>
                        {'Do it.'}
                    </button>
                </div>
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

