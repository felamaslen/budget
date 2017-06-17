/**
 * Displays bar at the top of the page, including navigation
 */

import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PureControllerView from './PureControllerView';
import { capitalise } from '../misc/text';
import { PAGES, SERVER_UPDATE_ERROR, ERROR_LEVEL_ERROR } from '../misc/const';
import { ERROR_MSG_SERVER_UPDATE, TIMER_UPDATE_SERVER } from '../misc/config';
import {
  aUserLoggedOut, aCookiesLoaded, aPageNavigatedTo, aKeyPressed, aServerUpdated
} from '../actions/HeaderActions';
import {
  aErrorOpened
} from '../actions/ErrorActions';

export class Header extends PureControllerView {
  logout() {
    this.dispatchAction(aUserLoggedOut());
  }
  navToPage(page) {
    this.dispatchAction(aPageNavigatedTo(page));
  }
  /**
   * render a navigation bar with links to different pages
   * @returns {object} React <ul> element
   */
  renderNavBar() {
    const pageLinksList = PAGES.map((item, key) => {
      return (
        <li key={key}>
          <a onClick={() => this.navToPage(key)} className={classNames({
            'nav-link': true, active: key === this.props.navPageIndex
          })} id={`nav-link-${item}`}>{capitalise(item)}</a>
        </li>
      );
    });

    return (
      <ul className="nav-list noselect">
        {pageLinksList}
        <li>
          <a className='nav-link' id='nav-link-logout' onClick={() => this.logout()}>Log out</a>
        </li>
      </ul>
    );
  }
  componentWillMount() {
    this.dispatchAction(aCookiesLoaded());
    window.addEventListener('keydown', evt => {
      if (evt.key === 'Tab') {
        evt.preventDefault();
      }
      this.dispatchAction(aKeyPressed({
        key: evt.key,
        shift: evt.shiftKey,
        ctrl: evt.ctrlKey
      }));
    });

    window.setTimeout(() => {
      this.dispatchAction(aServerUpdated());
    }, TIMER_UPDATE_SERVER);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.serverUpdateStatus !== nextProps.serverUpdateStatus) {
      if (nextProps.serverUpdateStatus === SERVER_UPDATE_ERROR) {
        this.dispatchNext(aErrorOpened(map({
          level: ERROR_LEVEL_ERROR,
          text: ERROR_MSG_SERVER_UPDATE
        })));
      }
      window.setTimeout(() => {
        this.dispatchAction(aServerUpdated());
      }, TIMER_UPDATE_SERVER);
    }
  }
  render() {
    const navBar = this.props.showNav ? this.renderNavBar() : null;
    const loadingApiSpinner = this.props.loadingApi ? (
      <span className="loading-api"></span>
    ) : null;

    return (
      <div id="nav">
        <div className="inner">
          <div className="app-logo">
            <a className="logo">
              <span>Budget</span>
              {loadingApiSpinner}
            </a>
          </div>
          {navBar}
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  showNav: PropTypes.bool,
  loadingApi: PropTypes.bool,
  navPageIndex: PropTypes.number,
  serverUpdateStatus: PropTypes.number
};
