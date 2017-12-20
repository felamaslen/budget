import bodyContainer, { Body } from '.';

import { PAGES, LIST_COLS_MOBILE } from '../../../../misc/const';

import { aMobileAddDialogOpened } from '../../../../actions/form.actions';

import React from 'react';
import PropTypes from 'prop-types';

import { ListRowMobileContainer as getListRowMobileDefault } from '../row/mobile';

export class BodyMobile extends Body {
    constructor(props) {
        super(props);

        this.ListRowMobile = this.listRowMobile();
    }
    listRowMobile() {
        return getListRowMobileDefault(this.props.page);
    }
    render() {
        const { page, rowIds, openMobileAddDialog } = this.props;

        const colKeys = LIST_COLS_MOBILE
            .map(column => PAGES[page].cols.indexOf(column));

        const rows = rowIds.map(id => <this.ListRowMobile key={id} id={id} colKeys={colKeys} />);

        return <div>
            <ul className="list-ul">{rows}</ul>
            <div className="button-add-outer">
                <button type="button" className="button-add" onClick={() => openMobileAddDialog()}>{'Add'}</button>
            </div>;
        </div>;
    }
}

BodyMobile.propTypes = {
    openMobileAddDialog: PropTypes.func.isRequired
};

export const mapDispatchToProps = page => dispatch => ({
    openMobileAddDialog: () => dispatch(aMobileAddDialogOpened(page))
});

export const BodyMobileContainer = page =>
    bodyContainer(page)(null, mapDispatchToProps)(BodyMobile);

export default page => bodyContainer(page);

