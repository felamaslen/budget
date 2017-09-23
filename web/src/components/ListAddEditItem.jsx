import { connect } from 'react-redux';

import { LIST_COLS_PAGES } from '../misc/const';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getEditable from './Editable';

class ListAddEditItem extends Component {
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

ListAddEditItem.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    apiKey: PropTypes.string.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    id: PropTypes.number,
    item: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    active: PropTypes.bool.isRequired,
    noSuggestions: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
    value: state.getIn(['global', 'edit', 'add', ownProps.col]),
    active: state.getIn(['global', 'edit', 'row']) === ownProps.row &&
        state.global.getIn(['edit', 'col']) === ownProps.col,
    item: LIST_COLS_PAGES[ownProps.pageIndex][ownProps.col]
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ListAddEditItem);

