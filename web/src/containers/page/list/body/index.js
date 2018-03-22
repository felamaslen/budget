import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries } from '../../../../constants';
import bodyDesktop from './desktop';
import bodyMobile from './mobile';

const mapStateToProps = (state, { page }) => ({
    rowIds: state
        .getIn(['pages', page, 'rows'])
        .keySeq()
        .toList()
});

const propTypes = {
    page: PropTypes.string.isRequired,
    rowIds: PropTypes.instanceOf(list).isRequired
};

function renderBody(isMobile, props) {
    if (isMobile) {
        const BodyMobile = bodyMobile(propTypes, mapStateToProps);

        return <BodyMobile {...props} />;
    }

    const BodyDesktop = bodyDesktop(propTypes, mapStateToProps);

    return <BodyDesktop {...props} />;
}

export default function Body(props) {
    return <Media query={mediaQueries.mobile}>{isMobile => renderBody(isMobile, props)}</Media>;
}

Body.propTypes = {
    page: PropTypes.string.isRequired
};

