/*
 * Simple component which renders stuff inside it
 * This doesn't handle any sort of grpah rendering logic, it's just to
 * standardise the component markup
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Graph(props) {
    const {
        name,
        width,
        height,
        svgClasses,
        svgProperties,
        outerProperties,
        before,
        after,
        children
    } = props;

    const className = classNames('graph-container', `graph-${name}`);

    const attachProps = (propsObject = {}) => Object.keys(propsObject)
        .reduce((proc, key) => ({ ...proc, [key]: propsObject[key](props) }), {});

    const outerPropertiesProc = attachProps(outerProperties);
    const svgPropertiesProc = attachProps(svgProperties);

    return (
        <div className={className} {...outerPropertiesProc}>
            {before || null}
            <svg
                className={svgClasses || ''}
                width={width}
                height={height}
                {...svgPropertiesProc}>

                {children || null}
            </svg>
            {after || null}
        </div>
    );
}

Graph.propTypes = {
    name: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array,
    svgClasses: PropTypes.string,
    svgProperties: PropTypes.object,
    outerProperties: PropTypes.object,
    before: PropTypes.object,
    after: PropTypes.object,
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ])
};

