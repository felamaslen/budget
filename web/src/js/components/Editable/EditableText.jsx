/**
 * Editable form element component - currency
 */

import PropTypes from 'prop-types';
import Editable from './Editable';

export default class EditableText extends Editable {
  constructor(props) {
    super(props);
    this.inputProps = { type: 'text' };
    this.editableType = 'text';
  }
}

EditableText.propTypes = {
  value: PropTypes.string
};

