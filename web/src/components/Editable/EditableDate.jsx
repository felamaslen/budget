/**
 * Editable form element - date
 */

import PropTypes from 'prop-types';
import Editable from './Editable';
import { YMD } from '../../misc/date';

export default class EditableDate extends Editable {
    constructor(props) {
        super(props);
        this.editableType = 'date';
    }
    format() {
        return this.props.value ? this.props.value.format() : '';
    }
    getEditValue(rawInputValue) {
        const ymd = new YMD(rawInputValue);

        return ymd.valid ? ymd : this.props.value;
    }
}

EditableDate.propTypes = {
    value: PropTypes.instanceOf(YMD)
};

