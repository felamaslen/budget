/**
 * Editable form element component - currency
 */

import PropTypes from 'prop-types';
import Editable from './Editable';
import { formatCurrency } from '../../misc/format';

export default class EditableCost extends Editable {
  constructor(props) {
    super(props);
    this.editableType = 'cost';
  }
  format() {
    return formatCurrency(this.props.value);
  }
  getDefaultValue() {
    return this.props.value ? this.props.value / 100 : '';
  }
  getEditValue(rawInputValue) {
    const value = Math.round(parseFloat(rawInputValue, 10) * 100);
    if (isNaN(value)) {
      return this.props.value;
    }
    return value;
  }
}

EditableCost.propTypes = {
  value: PropTypes.number
};

