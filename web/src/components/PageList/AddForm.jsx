import { connect } from 'react-redux';

import { aListItemAdded } from '../../actions/EditActions';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { PAGES, LIST_COLS_PAGES } from '../../misc/const';

import ListAddEditItem from '../ListAddEditItem';

export class AddForm extends PureComponent {
    constructor(props) {
        super(props);

        this.addItems = [];
    }
    shouldComponentUpdate(nextProps) {
        const addBtnFocus = !this.props.addBtnFocus && nextProps.addBtnFocus;

        if (addBtnFocus && this.addBtn) {
            setTimeout(() => this.addBtn.focus(), 0);

            return false;
        }

        return true;
    }
    render() {
        const addItems = LIST_COLS_PAGES[this.props.pageIndex].map((item, col) => {
            const ref = editable => {
                this.addItems.push(editable);
            };

            return <ListAddEditItem pageIndex={this.props.pageIndex}
                key={col} ref={ref} row={-1} col={col} id={null}
                noSuggestions={this.props.noSuggestions} />;
        });

        const addBtnOnClick = () => this.props.addListItem();
        const addBtnRef = input => {
            this.addBtn = input;
        };

        return <li className="li-add">
            {addItems}
            <span>
                <button ref={addBtnRef} onClick={addBtnOnClick}>Add</button>
            </span>
        </li>;
    }
}

AddForm.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    noSuggestions: PropTypes.bool.isRequired,
    addListItem: PropTypes.func.isRequired,
    addBtnFocus: PropTypes.bool.isRequired
}

const mapStateToProps = (state, ownProps) => ({
    noSuggestions: ['funds'].indexOf(PAGES[ownProps.pageIndex]) !== -1,
    addBtnFocus: state.getIn(['global', 'edit', 'addBtnFocus'])
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addListItem: () => dispatch(aListItemAdded({ pageIndex: ownProps.pageIndex }))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddForm);

