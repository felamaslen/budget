import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as Styled from './styles';

export default function Graph({
    name,
    width,
    height,
    graphRef,
    svgProperties,
    outerProperties,
    before,
    after,
    children,
}) {
    return (
        <Styled.Graph
            ref={graphRef}
            className={classNames('graph-container', {
                [`graph-${name}`]: name,
            })}
            {...outerProperties}
        >
            {before && before()}
            <svg width={width} height={height} {...svgProperties}>
                {children}
            </svg>
            {after && after()}
        </Styled.Graph>
    );
}

Graph.propTypes = {
    name: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array,
    graphRef: PropTypes.object,
    svgProperties: PropTypes.object,
    outerProperties: PropTypes.object,
    before: PropTypes.func,
    after: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Graph.defaultProps = {
    before: null,
    after: null,
    outerProperties: {},
    svgProperties: {},
    children: null,
};
