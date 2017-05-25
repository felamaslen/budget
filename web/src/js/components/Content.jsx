/**
 * Calls different page components
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { List } from 'immutable';

export class Content extends PureControllerView {
  render() {
    return (
      <div id='content'>
        <div className='inner'>
          {this.props.index}
        </div>
      </div>
    );
  }
}

Content.propTypes = {
  pages: PropTypes.instanceOf(List),
  index: PropTypes.number
};

