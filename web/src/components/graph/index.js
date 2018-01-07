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
            padding: padding || [0, 0, 0, 0]
        };

        this.onResize = debounce(() => {
            if (window.innerWidth < this.state.width) {
                this.setState({
                    width: window.innerWidth
                });
            }
            else if (this.state.width < this.props.width) {
                this.setState({
                    width: this.props.width
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
    componentDidUpdate(prevProps) {
        if (!(prevProps.width === this.props.width && prevProps.height === this.props.height)) {
            this.setState({ width: this.props.width, height: this.props.height });
        }

        this.draw();
    }
    render() {
        const { name, canvasClasses, canvasProperties, outerProperties, before, after } = this.props;

        const className = classNames('graph-container', `graph-${name}`);

        const canvasRef = canvas => this.setState({
            canvas,
            ctx: canvas && canvas.getContext && canvas.getContext('2d')
        });

        const attachProps = (propsObject = {}) => Object.keys(propsObject)
            .reduce((proc, key) => ({ ...proc, [key]: propsObject[key](this.props, this.state) }), {});

        const outerPropertiesProc = attachProps(outerProperties);
        const canvasPropertiesProc = attachProps(canvasProperties);

        return <div className={className} {...outerPropertiesProc}>
            {before || null}
            <canvas
                ref={canvasRef}
                className={canvasClasses || ''}
                width={this.state.width}
                height={this.state.height}
                {...canvasPropertiesProc}
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
    canvasProperties: PropTypes.object,
    outerProperties: PropTypes.object,
    before: PropTypes.object,
    after: PropTypes.object,
    onDraw: PropTypes.func.isRequired
};

