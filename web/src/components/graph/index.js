/*
 * React component to display a graph
 */

import React from 'react';
import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import debounce from '../../misc/debounce';

export default class Graph extends PureComponent {
    constructor(props) {
        super(props);

        const { width, height, padding } = props;

        this.state = {
            ctx: null,
            canvas: null,
            width,
            height,
            padding: padding || [0, 0, 0, 0],
            canvasProperties: {},
            outerProperties: {}
        };

        this.onResize = debounce(() => {
            if (window.innerWidth < this.width) {
                this.setState({
                    width: window.innerWidth
                });
            }
        }, 100);
    }
    draw() {
        if (!this.state.ctx) {
            return;
        }

        this.state.ctx.clearRect(0, 0, this.state.width, this.state.height);

        this.props.onDraw(this.props, this.state, this);
    }
    componentDidMount() {
        window.addEventListener('resize', this.onResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }
    componentDidUpdate() {
        this.draw();
    }
    render() {
        const { name, canvasClasses, before, after } = this.props;

        const className = classNames('graph-container', `graph-${name}`);

        const canvasRef = canvas => this.setState({
            canvas,
            ctx: canvas && canvas.getContext && canvas.getContext('2d')
        });

        return <div className={className} {...this.state.outerProperties}>
            {before || null}
            <canvas
                ref={canvasRef}
                className={canvasClasses || ''}
                width={this.state.width}
                height={this.state.height}
                {...this.state.canvasProperties}
            />
            {after || null}
        </div>;
    }
}

Graph.propTypes = {
    name: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array,
    canvasClasses: PropTypes.string,
    before: PropTypes.object,
    after: PropTypes.object,
    onDraw: PropTypes.func.isRequired
};

