/**
 * Calls different page components
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { List } from 'immutable';
import { Spinner } from './Spinner';

import { PageOverview } from './pages/PageOverview';

export class Content extends PureControllerView {
  renderPage() {
    if (this.props.index === 0) {
      // overview page
      return (
        <PageOverview dispatcher={this.props.dispatcher}
          data={this.props.pages.get(0)} />
      );
    }
    return <div>TODO: page {this.props.index}</div>;
  }
  render() {
    if (!this.props.loaded.get(this.props.index)) {
      return <Spinner />;
    }

    const page = this.renderPage();

    return (
      <div id='content'>
        <div className='inner'>
          {page}
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

