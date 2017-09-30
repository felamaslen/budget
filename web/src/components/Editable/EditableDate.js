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
        if (this.props.value) {
            return this.props.value.format();
        }

        return '';
    }
    getEditValue(rawInputValue) {
        const ymd = new YMD(rawInputValue);

        if (ymd.valid) {
            return ymd;
        }

        return this.props.value;
    }
}

EditableDate.propTypes = {
    value: PropTypes.instanceOf(YMD)
};

