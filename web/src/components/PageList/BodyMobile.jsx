import bodyContainer, { Body } from './Body';

import { LIST_COLS_PAGES, LIST_COLS_MOBILE } from '../../misc/const';

import { aMobileAddDialogOpened } from '../../actions/FormActions';

import React from 'react';
import PropTypes from 'prop-types';

import { ListRowMobileContainer as getListRowMobileDefault } from './ListRowMobile';

export class BodyMobile extends Body {
    renderAddButton() {
        const onClick = () => this.props.openMobileAddDialog();

        return <div className="button-add-outer">
            <button type="button" className="button-add" onClick={onClick}>
                Add
            </button>
        </div>;
    }
    render() {
        const colKeys = LIST_COLS_MOBILE
            .map(column => LIST_COLS_PAGES[this.props.pageIndex].indexOf(column));

        const ListRowMobile = getListRowMobileDefault(this.props.pageIndex);

        const rows = this.props.rowIds.map(
            id => <ListRowMobile key={id} id={id} colKeys={colKeys} />
        );

        return <div>
            <ul className="list-ul">{rows}</ul>
            {this.renderAddButton()}
        </div>;
    }
}

BodyMobile.propTypes = {
    openMobileAddDialog: PropTypes.func.isRequired
};

const mapDispatchToProps = pageIndex => dispatch => ({
    openMobileAddDialog: () => dispatch(aMobileAddDialogOpened(pageIndex))
});

export const BodyMobileContainer = pageIndex => bodyContainer(pageIndex)(null, mapDispatchToProps)(BodyMobile);

