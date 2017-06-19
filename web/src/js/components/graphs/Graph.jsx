/*
 * React component to display a graph
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { HTML_CANVAS_SUPPORTED } from '../../misc/const';

export class Graph extends PureControllerView {
  constructor(props) {
    super(props);
    this.ctx = null;
    this.width = null;
    this.height = null;
    this.supported = null;
    this.padding = this.props.padding || [0, 0, 0, 0];
  }
  update() {
    return;
  }
  draw() {
    return;
  }
  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.supported = HTML_CANVAS_SUPPORTED;
    this.width = this.props.width;
    this.height = this.props.height;
  }
  componentDidUpdate() {
    this.update();
  }
  render() {
    const classes = `graph-container graph-${this.props.name}`;
    const canvas = HTML_CANVAS_SUPPORTED ? (
      <canvas ref='canvas' width={this.props.width} height={this.props.height} />
    ) : (
      <span>Canvas not supported</span>
    );

    return (
      <div className={classes}>
        {canvas}
      </div>
    );
  }
}

Graph.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  name: PropTypes.string,
  padding: PropTypes.object
};

