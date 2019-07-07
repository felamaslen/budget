import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './style.scss';

const Graph = ({
    name,
    svgRef,
    width,
    height,
    svgClasses,
    svgProperties,
    outerProperties,
    before,
    after,
    children
}) => (
    <div
        ref={svgRef}
        className={classNames('graph-container', { [`graph-${name}`]: name })}
        {...outerProperties}
    >
        {before && before()}
        <svg
            className={svgClasses}
            width={width}
            height={height}
            {...svgProperties}
        >
            {children}
        </svg>
        {after && after()}
    </div>
);

Graph.propTypes = {
    svgRef: PropTypes.object,
    name: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array,
    svgClasses: PropTypes.string,
    svgProperties: PropTypes.object,
    outerProperties: PropTypes.object,
    before: PropTypes.func,
    after: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ])
};

Graph.defaultProps = {
    before: null,
    after: null,
    svgRef: null,
    svgClasses: '',
    outerProperties: {},
    svgProperties: {},
    children: null
};

export default Graph;
