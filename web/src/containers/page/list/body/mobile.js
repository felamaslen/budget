import bodyContainer, { Body } from '.';

import { LIST_COLS_PAGES, LIST_COLS_MOBILE } from '../../../../misc/const';

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
        return getListRowMobileDefault(this.props.pageIndex);
    }
    render() {
        const colKeys = LIST_COLS_MOBILE
            .map(column => LIST_COLS_PAGES[this.props.pageIndex].indexOf(column));

        const rows = this.props.rowIds.map(
            id => <this.ListRowMobile key={id} id={id} colKeys={colKeys} />
        );

        const onAdd = () => this.props.openMobileAddDialog();

        return <div>
            <ul className="list-ul">{rows}</ul>
            <div className="button-add-outer">
                <button type="button" className="button-add" onClick={onAdd}>{'Add'}</button>
            </div>;
        </div>;
    }
}

BodyMobile.propTypes = {
    openMobileAddDialog: PropTypes.func.isRequired
};

export const mapDispatchToProps = pageIndex => dispatch => ({
    openMobileAddDialog: () => dispatch(aMobileAddDialogOpened(pageIndex))
});

export const BodyMobileContainer = pageIndex => bodyContainer(pageIndex)(null, mapDispatchToProps)(BodyMobile);

export default pageIndex => bodyContainer(pageIndex);

