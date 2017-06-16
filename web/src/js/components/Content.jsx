/**
 * Calls different page components
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { Map as map, List } from 'immutable';
import { PAGES } from '../misc/const';

import { Spinner } from './Spinner';
import { PageOverview } from './pages/PageOverview';
import { PageFood } from './pages/PageFood';

export class Content extends PureControllerView {
  renderPage() {
    if (this.props.index === 0) {
      // overview page
      return (
        <PageOverview dispatcher={this.props.dispatcher}
          data={this.props.pages.get(0)}
          edit={this.props.edit} />
      );
    }
    if (this.props.index === 5) {
      // food page
      return (
        <PageFood dispatcher={this.props.dispatcher}
          data={this.props.pages.get(0)}
          edit={this.props.edit}
          index={this.props.index}
          page={PAGES[this.props.index]} />
      );
    }
    return <div>TODO: page {this.props.index}</div>;
  }
  render() {
    if (!this.props.loaded.get(this.props.index)) {
      return <Spinner />;
    }

    const page = this.renderPage();
    const pageName = `page-${PAGES[this.props.index]}`;

    return (
      <div id='content' className={pageName}>
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
  index: PropTypes.number,
  edit: PropTypes.instanceOf(map)
};

