/**
 * React component to display a simple header at the top of the page
 */

import React from 'react';

import PureControllerView from './PureControllerView';

export class Header extends PureControllerView {
  render() {
    return (
      <div id="header">
        <h1>Survey Form</h1>
      </div>
    );
  }
}
