/**
 * Editable form element component - currency
 */

import PropTypes from 'prop-types';
import Editable from './Editable';
import { formatCurrency } from '../../misc/format';

export default class EditableCost extends Editable {
  constructor(props) {
    super(props);
    this.inputProps = { type: 'number', step: '0.01' };
    this.editableType = 'cost';
  }
  format() {
    return formatCurrency(this.props.value);
  }
  getDefaultValue() {
    return this.props.value / 100;
  }
  getEditValue(rawInputValue) {
    return Math.round(parseFloat(rawInputValue, 10) * 100);
  }
}

EditableCost.propTypes = {
  value: PropTypes.number
};

