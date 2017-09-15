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
        this.padding = [0, 0, 0, 0];
        this.canvasProperties = {};
        this.outerProperties = {};
    }
    update() {
        return null;
    }
    draw() {
        return null;
    }
    beforeCanvas() {
        return null;
    }
    afterCanvas() {
        return null;
    }
    canvasClasses() {
        return null;
    }
    componentWillMount() {
        this.supported = HTML_CANVAS_SUPPORTED;
    }
    componentDidMount() {
        this.ctx = this.canvas.getContext('2d');
        this.width = this.props.width;
        this.height = this.props.height;
        this.update();
    }
    componentDidUpdate() {
        this.update();
    }
    getCanvas() {
        if (!this.supported) {
            return <span>Canvas not supported</span>;
        }

        const canvasRef = () => {
            return elem => {
                this.canvas = elem;
            };
        };

        return (
            <canvas ref={canvasRef()} {...this.canvasProperties}
                className={this.canvasClasses()}
                width={this.props.width} height={this.props.height} />
        );
    }
    render() {
        const classes = `graph-container graph-${this.props.name}`;
        const canvas = this.getCanvas();

        return (
            <div className={classes} {...this.outerProperties}>
                {this.beforeCanvas()}
                {canvas}
                {this.afterCanvas()}
            </div>
        );
    }
}

Graph.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    name: PropTypes.string
};

