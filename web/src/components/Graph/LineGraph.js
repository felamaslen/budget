/**
 * React component to display a line graph (e.g. time series)
 */

import PropTypes from 'prop-types';
import React from 'react';
import ImmutableComponent from '../../ImmutableComponent';
import debounce from '../../helpers/debounce';
import { rgba } from '../../helpers/color';
import { COLOR_GRAPH_TITLE } from '../../constants/colors';
import LineGraphDumb from './LineGraphDumb';

function getClosest(lines, position) {
    if (!position) {
        return null;
    }

    const { valX, valY } = position;

    return lines.reduce((red, line, lineIndex) => {
        return line.get('data').reduce((last, point) => {
            const dist = (((point.get(0) - valX) ** 2) +
                ((point.get(1) - valY) ** 2)) ** 0.5;

            if (last && dist > last.dist) {
                return last;
            }

            return { dist, lineIndex, point };
        }, red);
    }, null);
}

export default class LineGraph extends ImmutableComponent {
    constructor(props) {
        super(props);

        this.state = {
            hlPoint: null
        };

        this.updateCalc();
    }
    onHover(position) {
        const closest = getClosest(this.props.lines, position);
        if (!closest) {
            return this.setState({ hlPoint: null });
        }

        const { lineIndex, point } = closest;
        const lineColor = this.props.lines.getIn([lineIndex, 'color']);
        const color = typeof lineColor === 'string'
            ? lineColor
            : rgba(COLOR_GRAPH_TITLE);

        return this.setState({
            hlPoint: {
                valX: point.get(0),
                valY: point.get(1),
                color
            }
        });
    }
    updateCalc() {
        this.mouseEffects = this.getMouseEffects();
    }
    getOnMouseMove(customHandler) {
        return ({ valX, valY }) => {
            const handler = debounce((pageX, pageY, currentTarget) => {
                const { left, top } = currentTarget.getBoundingClientRect();

                this.onHover({
                    valX: valX(pageX - left),
                    valY: valY(pageY - top)
                });
            }, 10, true);

            return evt => {
                customHandler(evt);
                const { pageX, pageY, currentTarget } = evt;

                return handler(pageX, pageY, currentTarget);
            };
        };
    }
    getOnMouseLeave(customHandler) {
        return () => evt => {
            customHandler(evt);
            this.onHover(null);
        };
    }
    getMouseEffects() {
        if (this.props.isMobile || !this.props.hoverEffect) {
            return {};
        }

        const outerProps = this.props.outerProperties || {};
        const noop = () => null;

        return {
            outerProperties: {
                onMouseMove: this.getOnMouseMove(outerProps.onMouseMove || noop),
                onMouseLeave: this.getOnMouseLeave(outerProps.onMouseLeave || noop)
            }
        };
    }
    componentWillUpdate(nextProps) {
        if (!(this.props.width === nextProps.width &&
            this.props.height === nextProps.height)) {

            this.updateCalc();
        }
    }
    render() {
        return (
            <LineGraphDumb
                {...this.props}
                {...this.mouseEffects}
                hlPoint={this.state.hlPoint}
            />
        );
    }
}

LineGraph.propTypes = {
    isMobile: PropTypes.bool
};

