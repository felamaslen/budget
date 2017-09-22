import { connect } from 'react-redux';

import { LIST_COLS_PAGES } from '../misc/const';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getEditable from './Editable';

export class EditListItem extends Component {
    render() {
        const editItem = getEditable({
            row: this.props.row,
            col: this.props.key,
            id: this.props.id,
            item: this.props.item,
            value: this.props.value,
            active: this.props.active
        });
        this.addItems.push(editItem);

        const spanClasses = classNames({
            [this.props.item]: true,
            active: this.props.active
        });

        return <span className={spanClasses}>
            {editItem}
        </span>;
    }
}

EditListItem.propTypes = {
    row: PropTypes.number.isRequired,
    key: PropTypes.number.isRequired,
    id: PropTypes.number,
    item: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    active: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    active: state.global.getIn(['edit', 'row']) === ownProps.row &&
        state.global.getIn(['edit', 'col']) === ownProps.key,
    item: LIST_COLS_PAGES[state.global.get('currentPageIndex')]
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EditListItem);

