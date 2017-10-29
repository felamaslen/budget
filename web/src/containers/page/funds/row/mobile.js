import connect, { ListRowMobile } from '../../list/row/mobile';

import { aMobileEditDialogOpened } from '../../../../actions/FormActions';

import React from 'react';

import { LIST_COLS_MOBILE } from '../../../../misc/const';
import { formatCurrency } from '../../../../misc/format';

export class ListRowFundsMobile extends ListRowMobile {
    renderGainInfoMobile(cost, gain) {
        if (!gain) {
            return null;
        }

        const formatOptions = {
            abbreviate: true,
            precision: 1
        };

        const costValue = <span className="cost-value">
            {formatCurrency(cost, formatOptions)}
        </span>;

        const value = cost
            ? formatCurrency(gain.get('value'), formatOptions)
            : '\u2013';

        const actualValue = <span className="actual-value">{value}</span>;

        return <span className="cost">
            {costValue}
            {actualValue}
        </span>;
    }
    render() {
        const items = super.renderItems(LIST_COLS_MOBILE.slice(0, 2));

        const gain = this.props.row.get('gain');
        const gainInfo = this.renderGainInfoMobile(
            this.props.row.getIn(['cols', this.props.colKeys[2]]), gain
        );

        const onClick = () => this.props.openMobileEditDialog(this.props.id);

        return <li onClick={onClick}>{items}{gainInfo}</li>;
    }
}

const mapDispatchToProps = pageIndex => dispatch => ({
    openMobileEditDialog: id => dispatch(
        aMobileEditDialogOpened(pageIndex, id)
    )
});

export default pageIndex => connect(pageIndex)(null, mapDispatchToProps)(ListRowFundsMobile);

