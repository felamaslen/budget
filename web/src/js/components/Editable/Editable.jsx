/**
 * Editable form element component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';

export default class Editable extends PureControllerView {
  render() {
    return (
      <span>editable</span>
    );
  }
}

Editable.propTypes = {
  active: PropTypes.bool,
  row: PropTypes.number,
  col: PropTypes.number,
  page: PropTypes.string,
  item: PropTypes.string,
  value: PropTypes.string
};

