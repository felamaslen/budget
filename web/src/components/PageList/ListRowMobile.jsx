import listRowContainer, { ListRow } from './ListRow';

import { LIST_COLS_MOBILE } from '../../misc/const';

import { aMobileEditDialogOpened } from '../../actions/FormActions';

import React from 'react';
import PropTypes from 'prop-types';

import getEditable from '../Editable';

export class ListRowMobile extends ListRow {
    render() {
        const items = LIST_COLS_MOBILE
            .map((column, key) => {
                const colKey = this.props.colKeys[key];

                const value = this.props.row.getIn(['cols', colKey]);

                const Editable = getEditable({
                    row: this.props.id,
                    col: colKey,
                    item: column,
                    value
                });

                return <span key={key} className={column}>
                    <Editable noSuggestions={true} pageIndex={this.props.pageIndex} />
                </span>;
            });

        const onClick = () => this.props.openMobileEditDialog(this.props.id);

        return <li onClick={onClick}>{items}</li>;
    }
}

ListRowMobile.propTypes = {
    colKeys: PropTypes.array.isRequired,
    openMobileEditDialog: PropTypes.func.isRequired
};

const mapDispatchToProps = pageIndex => dispatch => ({
    openMobileEditDialog: id => dispatch(
        aMobileEditDialogOpened(pageIndex, id)
    )
});

export const ListRowMobileContainer = pageIndex =>
    listRowContainer(pageIndex)(null, mapDispatchToProps)(ListRowMobile);

