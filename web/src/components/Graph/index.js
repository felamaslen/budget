import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './style.scss';

export default function Graph({
    name,
    width,
    height,
    graphRef,
    svgClasses,
    svgProperties,
    outerProperties,
    before,
    after,
    children,
}) {
    return (
        <div
            ref={graphRef}
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
}

Graph.propTypes = {
    name: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array,
    graphRef: PropTypes.object,
    svgClasses: PropTypes.string,
    svgProperties: PropTypes.object,
    outerProperties: PropTypes.object,
    before: PropTypes.func,
    after: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
    ]),
};

Graph.defaultProps = {
    before: null,
    after: null,
    svgClasses: '',
    outerProperties: {},
    svgProperties: {},
    children: null,
};
