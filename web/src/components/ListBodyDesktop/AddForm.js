import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PAGES } from '../../constants/data';
import ListAddEditItem from '../../containers/Editable/list-item';

export default class AddForm extends Component {
    componentDidUpdate(prevProps) {
        if (this.addBtn && this.addBtn.focus &&
            !prevProps.addBtnFocus && this.props.addBtnFocus) {

            setImmediate(() => this.addBtn.focus());
        }
    }
    render() {
        const { page, onAdd } = this.props;

        const addItems = PAGES[page].cols.map((item, col) => (
            <ListAddEditItem
                key={col}
                page={page}
                row={-1}
                col={col}
                id={null}
            />
        ));

        const addBtnRef = input => {
            this.addBtn = input;
        };

        return (
            <li className="li-add">
                {addItems}
                <span className="add-button-outer">
                    <button ref={addBtnRef} onClick={() => onAdd(page)}>{'Add'}</button>
                </span>
            </li>
        );
    }
}

AddForm.propTypes = {
    page: PropTypes.string.isRequired,
    addBtnFocus: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired
};

