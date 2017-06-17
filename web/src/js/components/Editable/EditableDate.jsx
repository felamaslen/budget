/**
 * Editable form element - date
 */

import PropTypes from 'prop-types';
import Editable from './Editable';
import { YMD } from '../../misc/date';

export default class EditableDate extends Editable {
  constructor(props) {
    super(props);
    this.inputProps = { type: 'date' };
    this.editableType = 'date';
  }
  format() {
    return this.props.value ? this.props.value.format() : '';
  }
  getDefaultValue() {
    return this.props.value ? this.props.value.formatISO() : '';
  }
  getEditValue(rawInputValue) {
    return new YMD(rawInputValue);
  }
}

EditableDate.propTypes = {
  value: PropTypes.instanceOf(YMD)
};

