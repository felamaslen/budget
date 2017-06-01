/**
 * Displays bar at the top of the page, including navigation
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PureControllerView from './PureControllerView';
import { capitalise } from '../misc/text';
import { PAGES } from '../misc/const';
import {
  aUserLoggedOut, aCookiesLoaded, aPageNavigatedTo, aKeyPressed
} from '../actions/HeaderActions';

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
      this.dispatchAction(aKeyPressed({
        key: evt.key,
        shift: evt.shiftKey,
        ctrl: evt.ctrlKey
      }));
    });
  }
  render() {
    const navBar = this.props.showNav ? this.renderNavBar() : null;

    return (
      <div id="nav">
        <div className="inner">
          <div className="app-logo">
            <a className="logo">Budget</a>
          </div>
          {navBar}
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  showNav: PropTypes.bool,
  navPageIndex: PropTypes.number
};
