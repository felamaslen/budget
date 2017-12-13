/*
 * React component to display a graph
 */

import React from 'react';
import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';
import { htmlCanvasSupported } from '../../misc/const';

export default class Graph extends PureComponent {
    constructor(props) {
        super(props);

        this.ctx = null;
        this.canvas = null;
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
        this.supported = htmlCanvasSupported();
    }
    componentDidMount() {
        this.width = this.props.width;
        this.height = this.props.height;
        this.update();
    }
    componentDidUpdate() {
        this.update();
    }
    render() {
        const classes = `graph-container graph-${this.props.name}`;

        const canvasRef = canvas => {
            this.canvas = canvas;
            if (canvas) {
                this.ctx = canvas.getContext('2d');
            }
        };

        return <div className={classes} {...this.outerProperties}>
            {this.beforeCanvas()}
            <canvas ref={canvasRef} {...this.canvasProperties}
                className={this.canvasClasses()}
                width={this.props.width} height={this.props.height} />
            {this.afterCanvas()}
        </div>;
    }
}

Graph.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    name: PropTypes.string
};

