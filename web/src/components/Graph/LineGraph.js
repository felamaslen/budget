/**
 * React component to display a line graph (e.g. time series)
 */

import PropTypes from 'prop-types';
import React from 'react';
import ImmutableComponent, { propsEqual } from '../../ImmutableComponent';
import debounce from '../../helpers/debounce';
import { rgba } from '../../helpers/color';
import { COLOR_GRAPH_TITLE } from '../../constants/colors';
import { GRAPH_ZOOM_SPEED } from '../../constants/graph';
import LineGraphDumb from './LineGraphDumb';

function getClosest(lines, position) {
    if (!position) {
        return null;
    }

    const { valX, valY } = position;

    return lines.reduce((red, line, lineIndex) => {
        return line.get('data').reduce((last, point, index) => {
            const dist = (((point.get(0) - valX) ** 2) +
                ((point.get(1) - valY) ** 2)) ** 0.5;

            if (last && dist > last.dist) {
                return last;
            }

            return { dist, lineIndex, point, index };
        }, red);
    }, null);
}

const pointVisible = (valX, minX, maxX) => valX >= minX && valX <= maxX;

function pointsVisible(lines) {
    const threshold = 4;

    return Boolean(lines.find(line => line.get('data').size > threshold));
}

function zoomLines(lines, { minX, maxX }) {
    const result = lines.map(line => {
        const data = line.get('data');

        return line.set('data', data.filter((point, pointKey) => {
            if (pointVisible(point.get(0), minX, maxX)) {
                return true;
            }
            if (pointKey < data.size - 1 &&
                pointVisible(data.getIn([pointKey + 1, 0]), minX, maxX)) {
                return true;
            }
            if (pointKey > 0 &&
                pointVisible(data.getIn([pointKey - 1, 0]), minX, maxX)) {
                return true;
            }

            return false;
        }));
    });

    return result;
}

function getZoomedRange(props, state, position, zoomLevel) {
    let { minX, maxX } = state.zoom;

    if (position) {
        const range = props.maxX - props.minX;
        const newRange = range * (1 - GRAPH_ZOOM_SPEED) ** zoomLevel;

        let newMinXTarget = position - newRange / 2;
        let newMaxXTarget = position + newRange / 2;
        if (newMinXTarget < props.minX) {
            newMaxXTarget += props.minX - newMinXTarget;
            newMinXTarget = props.minX;
        }
        else if (newMaxXTarget > props.maxX) {
            newMinXTarget -= newMaxXTarget - props.maxX;
            newMaxXTarget = props.maxX;
        }

        minX = Math.max(props.minX, Math.round(newMinXTarget));
        maxX = Math.min(props.maxX, Math.round(newMaxXTarget));
    }

    const zoomedLines = zoomLines(props.lines, { minX, maxX });
    if (!pointsVisible(zoomedLines)) {
        return null;
    }

    return props.zoomEffect(props, zoomedLines, { minX, maxX });
}

function getHlColor(color, point, index) {
    if (typeof color === 'string') {
        return color;
    }
    if (typeof color === 'function') {
        return color(point, index);
    }

    return rgba(COLOR_GRAPH_TITLE);
}

export default class LineGraph extends ImmutableComponent {
    constructor(props) {
        super(props);

        this.state = {
            hlPoint: null,
            zoom: {},
            zoomLevel: 0
        };

        this.updateCalc();
    }
    onHover(position) {
        const closest = getClosest(this.props.lines, position);
        if (!closest) {
            return this.setState({ hlPoint: null });
        }

        const { lineIndex, point, index } = closest;
        const color = getHlColor(this.props.lines.getIn([lineIndex, 'color']), point, index);

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
    setZoom(position = null, zoomLevel = this.state.zoomLevel) {
        const zoom = getZoomedRange(this.props, this.state, position, zoomLevel);
        if (!zoom) {
            return;
        }

        this.setState({
            zoom,
            zoomLevel
        });
    }
    onWheel(customHandler) {
        return ({ valX }) => evt => {
            customHandler(evt);
            evt.preventDefault();

            if (!this.state.hlPoint && !(evt.currentTarget && evt.currentTarget.offsetParent)) {
                return null;
            }

            const position = this.state.hlPoint
                ? this.state.hlPoint.valX
                : valX(evt.pageX - evt.currentTarget.offsetParent.offsetLeft);

            // direction: in is -1, out is +1
            const direction = evt.deltaY / Math.abs(evt.deltaY);
            const zoomLevel = Math.max(0, this.state.zoomLevel - direction);

            return this.setZoom(position, zoomLevel);
        };
    }
    getMouseEffects() {
        if (this.props.isMobile) {
            return {};
        }

        const outerProperties = { ...(this.props.outerProperties || {}) };
        const svgProperties = { ...(this.props.svgProperties || {}) };
        const noop = () => null;

        if (this.props.hoverEffect) {
            outerProperties.onMouseMove = this.getOnMouseMove(outerProperties.onMouseMove || noop);
            outerProperties.onMouseLeave = this.getOnMouseLeave(outerProperties.onMouseLeave || noop);
        }
        if (this.props.zoomEffect) {
            svgProperties.onWheel = this.onWheel(svgProperties.onWheel || noop);
        }

        return { outerProperties, svgProperties };
    }
    componentWillUpdate(nextProps) {
        if (!(this.props.width === nextProps.width &&
            this.props.height === nextProps.height)) {

            this.updateCalc();
        }
    }
    componentDidUpdate(prevProps) {
        const resetRange = (this.props.zoomEffect || prevProps.zoomEffect) && !(
            this.props.zoomEffect &&
            this.props.minX === prevProps.minX &&
            this.props.maxX === prevProps.maxX &&
            this.props.minY === prevProps.minY &&
            this.props.maxY === prevProps.maxY
        );

        if (resetRange) {
            this.setState({
                zoom: {},
                zoomLevel: 0
            });
        }
        else if (this.props.zoomEffect && !propsEqual(prevProps, this.props)) {
            this.setZoom();
        }
    }
    render() {
        return (
            <LineGraphDumb
                {...this.props}
                {...this.mouseEffects}
                hlPoint={this.state.hlPoint}
                {...this.state.zoom}
            />
        );
    }
}

LineGraph.propTypes = {
    isMobile: PropTypes.bool,
    hoverEffect: PropTypes.object,
    zoomEffect: PropTypes.func
};

