import React from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import FormFieldDate from './FormFieldDate';
import FormFieldNumber from './FormFieldNumber';
import FormFieldCost from './FormFieldCost';
import { TransactionsList } from '../../misc/data';

export default class FormFieldTransactions extends FormField {
    renderTransaction(item, key) {
        const dateValue = item.get('date');
        const dateChange = ymd => this.props.onDateChange(this.props.value, ymd, key);
        const dateInput = <FormFieldDate value={dateValue}
            onChange={dateChange} />;

        const unitsValue = item.get('units');
        const unitsChange = units => this.props.onUnitsChange(this.props.value, units, key);
        const unitsInput = <FormFieldNumber value={unitsValue}
            onChange={unitsChange} />;

        const costValue = item.get('cost');
        const costChange = cost => this.props.onCostChange(this.props.value, cost, key);
        const costInput = <FormFieldCost value={costValue}
            onChange={costChange} />;

        return <li key={key}>
            <span className="transaction">
                <span className="row">
                    <span className="col">Date:</span>
                    <span className="col">{dateInput}</span>
                </span>
                <span className="row">
                    <span className="col">Units:</span>
                    <span className="col">{unitsInput}</span>
                </span>
                <span className="row">
                    <span className="col">Cost:</span>
                    <span className="col">{costInput}</span>
                </span>
            </span>
        </li>;
    }
    renderList() {
        const items = this.props.value.list
            .map((item, key) => this.renderTransaction(item, key));

        return items;
    }
    renderInput() {
        const transactionsList = this.renderList();

        return <ul className="transactions-list">
            {transactionsList}
        </ul>;
    }
}

FormFieldTransactions.propTypes = {
    value: PropTypes.instanceOf(TransactionsList),
    onDateChange: PropTypes.func,
    onUnitsChange: PropTypes.func,
    onCostChange: PropTypes.func
};

