/**
 * Calls different page components
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { List } from 'immutable';
import { Spinner } from './Spinner';

export class Content extends PureControllerView {
  render() {
    if (!this.props.loaded.get(this.props.index)) {
      return <Spinner />;
    }
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
  loaded: PropTypes.instanceOf(List),
  index: PropTypes.number
};

