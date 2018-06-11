/**
 * React component to display a line graph (e.g. time series)
 */

import PropTypes from 'prop-types';
import React from 'react';
import debounce from 'debounce';
import ImmutableComponent, { propsChanged } from '../../ImmutableComponent';
import { rgba } from '../../helpers/color';
import { genPixelCompute } from './helpers';
import { COLOR_GRAPH_TITLE } from '../../constants/colors';
import { GRAPH_ZOOM_SPEED } from '../../constants/graph';
import LineGraphDumb from './LineGraphDumb';

function getClosest(lines, position, mvt) {
    if (!position) {
        return null;
    }

    const { posX, posY } = position;

    return lines.reduce((red, line, lineIndex) => {
        return line.get('data').reduce((last, point, index) => {
            const distX = mvt.pixX(point.get(0)) - posX;
            const distY = mvt.pixY(point.get(1)) - posY;

            const dist = (distX ** 2) + (distY ** 2);

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
    return lines.map(line => {
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

const noop = () => null;

export default class LineGraph extends ImmutableComponent {
    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        padding: PropTypes.array,
        minX: PropTypes.number,
        maxX: PropTypes.number,
        minY: PropTypes.number,
        maxY: PropTypes.number,
        isMobile: PropTypes.bool,
        hoverEffect: PropTypes.object,
        outerProperties: PropTypes.object,
        svgProperties: PropTypes.object,
        zoomEffect: PropTypes.func
    };
    constructor(props) {
        super(props);

        this.state = {
            hlPoint: null,
            outerProperties: {
                onMouseMove: this.getOnMouseMove(),
                onMouseLeave: this.getOnMouseLeave()
            },
            svgProperties: {
                onWheel: this.getOnWheel()
            },
            padding: this.props.padding || [0, 0, 0, 0],
            zoom: {},
            zoomLevel: 0
        };
    }
    onHover(position, mvt) {
        if (!this.props.lines || this.props.isMobile) {
            return;
        }

        const closest = getClosest(this.props.lines, position, mvt);
        if (!closest) {
            this.setState({ hlPoint: null });

            return;
        }

        const { lineIndex, point, index } = closest;
        const color = getHlColor(this.props.lines.getIn([lineIndex, 'color']), point, index);

        this.setState({
            hlPoint: {
                valX: point.get(0),
                valY: point.get(1),
                color
            }
        });
    }
    getOnMouseMove(customHandler = noop) {
        return subProps => {
            const handler = debounce((pageX, pageY, currentTarget) => {
                const { left, top } = currentTarget.getBoundingClientRect();

                this.onHover({
                    posX: pageX - left,
                    posY: pageY - top
                }, subProps);

            }, 10, true);

            return evt => {
                customHandler(evt);
                const { pageX, pageY, currentTarget } = evt;

                return handler(pageX, pageY, currentTarget);
            };
        };
    }
    getOnMouseLeave(customHandler = noop) {
        return () => evt => {
            customHandler(evt);
            this.onHover(null);
        };
    }
    getOnWheel(customHandler = noop) {
        return ({ valX }) => evt => {
            customHandler(evt);
            if (this.props.isMobile || !this.props.zoomEffect) {
                return;
            }

            evt.preventDefault();

            if (!this.state.hlPoint && !(evt.currentTarget && evt.currentTarget.offsetParent)) {
                return;
            }

            const position = this.state.hlPoint
                ? this.state.hlPoint.valX
                : valX(evt.pageX - evt.currentTarget.offsetParent.offsetLeft);

            // direction: in is -1, out is +1
            const direction = evt.deltaY / Math.abs(evt.deltaY);
            const zoomLevel = Math.max(0, this.state.zoomLevel - direction);
            const zoom = getZoomedRange(this.props, this.state, position, zoomLevel);
            if (!zoom) {
                return;
            }

            const calc = genPixelCompute({
                padding: this.state.padding,
                width: this.props.width,
                height: this.props.height,
                lines: this.props.lines,
                minY: this.props.minY,
                maxY: this.props.maxY,
                minX: this.props.minX,
                maxX: this.props.maxX,
                ...zoom,
                zoomLevel
            });

            this.setState({ calc, zoom, zoomLevel });
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (propsChanged(nextProps, prevState.range)) {
            return {
                ...prevState,
                outerProperties: {
                    ...prevState.outerProperties,
                    ...nextProps.outerProperties
                },
                svgProperties: {
                    ...prevState.svgProperties,
                    ...nextProps.svgProperties
                },
                range: {
                    minX: nextProps.minX,
                    maxX: nextProps.maxX,
                    minY: nextProps.minY,
                    maxY: nextProps.maxY,
                    width: nextProps.width,
                    height: nextProps.height
                },
                calc: genPixelCompute({
                    padding: prevState.padding,
                    width: nextProps.width,
                    height: nextProps.height,
                    lines: nextProps.lines,
                    minY: nextProps.minY,
                    maxY: nextProps.maxY,
                    minX: nextProps.minX,
                    maxX: nextProps.maxX,
                    zoom: {},
                    zoomLevel: 0
                }),
                zoom: {},
                zoomLevel: 0
            };
        }

        return prevState;
    }
    render() {
        if (!this.state.calc) {
            return null;
        }

        return (
            <LineGraphDumb
                {...this.props}
                {...this.mouseEffects}
                {...this.state.zoom}
                calc={this.state.calc}
                outerProperties={this.state.outerProperties}
                svgProperties={this.state.svgProperties}
                hlPoint={this.state.hlPoint}
            />
        );
    }
}

