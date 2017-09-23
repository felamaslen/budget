import { connect } from 'react-redux';

import { PAGES, LIST_COLS_PAGES } from '../misc/const';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getEditable from './Editable';

export class EditListItem extends Component {
    render() {
        const Editable = getEditable({
            row: this.props.row,
            col: this.props.col,
            id: this.props.id,
            item: this.props.item,
            value: this.props.value
        });

        const spanClasses = classNames({
            [this.props.item]: true,
            active: this.props.active
        });

        return <span className={spanClasses}>
            <Editable pageIndex={this.props.pageIndex} apiKey={this.props.apiKey}
                noSuggestions={this.props.noSuggestions} />
        </span>;
    }
}

EditListItem.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    apiKey: PropTypes.string.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    id: PropTypes.number,
    item: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    active: PropTypes.bool.isRequired,
    noSuggestions: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    active: state.getIn(['global', 'edit', 'row']) === ownProps.row &&
        state.global.getIn(['edit', 'col']) === ownProps.col,
    item: LIST_COLS_PAGES[ownProps.pageIndex][ownProps.col],
    noSuggestions: ['funds'].indexOf(PAGES[ownProps.pageIndex]) !== -1
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EditListItem);

