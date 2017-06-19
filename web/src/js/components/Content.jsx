/**
 * Calls different page components
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from './PureControllerView';
import { Map as map, List } from 'immutable';
import { PAGES, LIST_PAGES, DAILY_PAGES } from '../misc/const';

import { Spinner } from './Spinner';
import { PageOverview } from './pages/PageOverview';
import { PageList } from './pages/PageList';
import { PageFunds } from './pages/PageFunds';

export class Content extends PureControllerView {
  renderPage() {
    const data = this.props.pages.get(this.props.index);
    const page = PAGES[this.props.index];
    if (page === 'overview') {
      // overview page
      return (
        <PageOverview dispatcher={this.props.dispatcher}
          data={data}
          edit={this.props.edit}
          showAll={this.props.showAllBalanceGraph} />
      );
    }
    if (page === 'funds') {
      // funds page
      return (
        <PageFunds dispatcher={this.props.dispatcher}
          data={data}
          edit={this.props.edit}
          add={this.props.add}
          addBtnFocus={this.props.addBtnFocus}
          daily={DAILY_PAGES[this.props.index]}
          index={this.props.index}
          page={page} />
      );
    }
    if (LIST_PAGES.indexOf(this.props.index) > -1) {
      // list page (e.g. food)
      return (
        <PageList dispatcher={this.props.dispatcher}
          data={data}
          edit={this.props.edit}
          add={this.props.add}
          addBtnFocus={this.props.addBtnFocus}
          daily={DAILY_PAGES[this.props.index]}
          index={this.props.index}
          page={page} />
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
  add: PropTypes.instanceOf(List),
  addBtnFocus: PropTypes.bool,
  edit: PropTypes.instanceOf(map),
  index: PropTypes.number,
  showAllBalanceGraph: PropTypes.bool
};

