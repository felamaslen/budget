import { connect } from 'react-redux';
import { aListItemAdded } from '../../../actions/edit.actions';
import React from 'react';
import PureComponent from '../../../immutable-component';
import PropTypes from 'prop-types';
import { PAGES } from '../../../constants/data';
import ListAddEditItem from '../../editable/list-item';

export class AddForm extends PureComponent {
    componentDidUpdate(prevProps) {
        if (this.addBtn && this.addBtn.focus &&
            !prevProps.addBtnFocus && this.props.addBtnFocus) {

            setTimeout(() => this.addBtn.focus(), 0);
        }
    }
    render() {
        const { page, addListItem } = this.props;

        const addItems = PAGES[page].cols.map((item, col) => <ListAddEditItem
            key={col}
            page={page}
            row={-1}
            col={col}
            id={null}
        />);

        const addBtnRef = input => {
            this.addBtn = input;
        };

        return <li className="li-add">
            {addItems}
            <span className="add-button-outer">
                <button ref={addBtnRef} onClick={() => addListItem()}>{'Add'}</button>
            </span>
        </li>;
    }
}

AddForm.propTypes = {
    page: PropTypes.string.isRequired,
    addListItem: PropTypes.func.isRequired,
    addBtnFocus: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    addBtnFocus: state.getIn(['edit', 'addBtnFocus'])
});

const mapDispatchToProps = (dispatch, { page }) => ({
    addListItem: () => dispatch(aListItemAdded({ page }))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddForm);

