import listRowContainer, { ListRow } from '../row';

import { LIST_COLS_MOBILE } from '../../../../misc/const';

import { aMobileEditDialogOpened } from '../../../../actions/form.actions';

import React from 'react';
import PropTypes from 'prop-types';

import getEditable from '../../../editable';

export class ListRowMobile extends ListRow {
    renderItems(columns = LIST_COLS_MOBILE) {
        return columns.map((column, key) => {
            const colKey = this.props.colKeys[key];

            const value = this.props.row.getIn(['cols', colKey]);

            const Editable = getEditable({
                row: this.props.id,
                col: colKey,
                item: column,
                value
            });

            return <span key={key} className={column}>
                <Editable static={true} page={this.props.page} />
            </span>;
        });
    }
    render() {
        const items = this.renderItems();

        const onClick = () => this.props.openMobileEditDialog(this.props.id);

        return <li onClick={onClick}>{items}</li>;
    }
}

ListRowMobile.propTypes = {
    colKeys: PropTypes.array.isRequired,
    openMobileEditDialog: PropTypes.func.isRequired
};

const mapDispatchToProps = page => dispatch => ({
    openMobileEditDialog: id => dispatch(aMobileEditDialogOpened(page, id))
});

export const ListRowMobileContainer = page =>
    listRowContainer(page)(null, mapDispatchToProps)(ListRowMobile);

export default page => listRowContainer(page);

